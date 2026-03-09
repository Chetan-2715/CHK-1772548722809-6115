"""
Medicine routes for searching, scanning, and verifying medicines.
"""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Header, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import get_db
from services.medicine_service import search_medicine, verify_tablet, record_medicine_history, get_user_medicine_history
from services.barcode_service import lookup_by_barcode, lookup_and_store_medicine, decode_barcode_from_image
from services.gemini_service import explain_medical_term
from routes.auth import get_current_user_id

router = APIRouter(prefix="/medicine", tags=["Medicine"])


class BarcodeRequest(BaseModel):
    barcode: str
    medicine_name: str | None = None


class VerifyTabletRequest(BaseModel):
    medicine_name: str | None = None
    barcode: str | None = None


class MedicalTermRequest(BaseModel):
    term: str


@router.get("/{name}")
async def get_medicine_by_name(
    name: str,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    """Get medicine information by name."""
    result = await search_medicine(name, db)

    if not result["success"]:
        raise HTTPException(status_code=500, detail=result.get("error", "Failed to get medicine info"))

    # Record history if user is authenticated
    if authorization:
        try:
            token = authorization.replace("Bearer ", "")
            user_id = get_current_user_id(token)
            record_medicine_history(user_id, name, "search", db, details={"source": result.get("source")})
        except Exception:
            pass

    return result


@router.post("/scan-barcode")
async def scan_barcode(
    request: BarcodeRequest,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    """Look up medicine by barcode."""
    result = await lookup_by_barcode(request.barcode, db)

    # If barcode not found but medicine name provided, fetch and store
    if not result["success"] and request.medicine_name:
        result = await lookup_and_store_medicine(
            request.medicine_name,
            request.barcode,
            db
        )

    # Record history if user is authenticated
    if authorization:
        try:
            token = authorization.replace("Bearer ", "")
            user_id = get_current_user_id(token)
            med_name = request.medicine_name or request.barcode
            record_medicine_history(user_id, med_name, "scan", db, details={"barcode": request.barcode})
        except Exception:
            pass

    return result


@router.post("/scan-barcode-image")
async def scan_barcode_image(
    file: UploadFile = File(...),
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    """Scan a barcode from an uploaded image."""
    image_bytes = await file.read()
    barcodes = decode_barcode_from_image(image_bytes)

    if not barcodes:
        return {
            "success": False,
            "message": "No barcode detected in the image. Try a clearer image or enter the barcode manually."
        }

    barcode = barcodes[0]
    result = await lookup_by_barcode(barcode, db)

    return {
        "barcode": barcode,
        "all_barcodes": barcodes,
        "lookup_result": result
    }


@router.post("/verify-tablet")
async def verify_tablet_endpoint(
    request: VerifyTabletRequest = None,
    file: UploadFile = File(None),
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    """Verify a tablet against user's prescriptions."""
    if not authorization:
        raise HTTPException(status_code=401, detail="Authentication required")

    token = authorization.replace("Bearer ", "")
    user_id = get_current_user_id(token)

    image_bytes = None
    mime_type = "image/jpeg"

    if file:
        image_bytes = await file.read()
        mime_type = file.content_type or "image/jpeg"

    medicine_name = ""
    barcode = None

    if request:
        medicine_name = request.medicine_name or ""
        barcode = request.barcode

    if not medicine_name and not image_bytes and not barcode:
        raise HTTPException(
            status_code=400,
            detail="Please provide a medicine name, barcode, or tablet image"
        )

    result = await verify_tablet(
        user_id=user_id,
        medicine_name=medicine_name,
        db=db,
        image_bytes=image_bytes,
        mime_type=mime_type,
        barcode=barcode
    )

    # Record in history
    record_medicine_history(
        user_id,
        medicine_name or "tablet_image",
        "verify",
        db,
        details={"status": result.get("status"), "barcode": barcode}
    )

    return result


@router.post("/explain-term")
async def explain_term(request: MedicalTermRequest):
    """Explain a medical term in simple English."""
    result = await explain_medical_term(request.term)

    if not result["success"]:
        raise HTTPException(status_code=500, detail=result.get("error", "Failed to explain term"))

    return result


@router.get("/history/all")
async def get_medicine_history_endpoint(
    authorization: str = Header(None),
    limit: int = Query(50, le=200),
    db: Session = Depends(get_db)
):
    """Get user's medicine interaction history."""
    if not authorization:
        raise HTTPException(status_code=401, detail="Authentication required")

    token = authorization.replace("Bearer ", "")
    user_id = get_current_user_id(token)

    history = get_user_medicine_history(user_id, db, limit)
    return {"history": history}
