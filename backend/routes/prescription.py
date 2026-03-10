"""
Prescription routes for uploading and managing prescriptions.
"""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Header
from sqlalchemy.orm import Session
from database import get_db
from models.prescription import Prescription, PrescriptionMedicine
from models.medicine import Medicine
from services.gemini_service import extract_prescription_data
from services.medicine_service import record_medicine_history
from routes.auth import get_current_user_id

router = APIRouter(prefix="/prescriptions", tags=["Prescriptions"])


@router.post("/upload")
async def upload_prescription(
    file: UploadFile = File(...),
    domain: str = Header(None),
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    """Upload a prescription image and extract medicines using Gemini Vision."""
    if not authorization:
        raise HTTPException(status_code=401, detail="Authentication required")

    token = authorization.replace("Bearer ", "")
    user_id = get_current_user_id(token)

    # Read file
    image_bytes = await file.read()
    mime_type = file.content_type or "image/jpeg"

    # Extract prescription data with Gemini Vision
    result = await extract_prescription_data(image_bytes, mime_type, domain)

    if not result["success"]:
        raise HTTPException(status_code=500, detail=result.get("error", "Failed to process prescription"))

    data = result["data"]

    # Create prescription record
    prescription = Prescription(
        user_id=user_id,
        raw_text=str(data),
        extracted_data=data,
        doctor_name=data.get("doctor_name"),
        hospital_name=data.get("hospital_name"),
    )
    db.add(prescription)
    db.commit()
    db.refresh(prescription)

    # Save individual medicines
    medicines_data = data.get("medicines", [])
    saved_medicines = []

    for med_data in medicines_data:
        med_name = med_data.get("medicine_name", "Unknown")

        # Check if medicine exists in database, if not create it
        existing_medicine = db.query(Medicine).filter(
            Medicine.name.ilike(f"%{med_name}%")
        ).first()

        if not existing_medicine:
            new_medicine = Medicine(
                name=med_name,
                manufacturer=med_data.get("manufacturer"),
                composition=med_data.get("composition"),
                usage=med_data.get("usage"),
                dosage=med_data.get("dosage"),
                side_effects=med_data.get("side_effects"),
                precautions=med_data.get("precautions"),
                suitable_age_range=med_data.get("suitable_age_range"),
                missed_dose_guidelines=med_data.get("missed_dose_guidelines"),
                usage_instructions=med_data.get("usage_instructions"),
                medical_terms_explanation=med_data.get("medical_terms_explanation"),
                source="prescription"
            )
            db.add(new_medicine)
            db.commit()
            db.refresh(new_medicine)
            existing_medicine = new_medicine

        # Link medicine to prescription
        prescription_medicine = PrescriptionMedicine(
            prescription_id=prescription.id,
            medicine_id=existing_medicine.id,
            medicine_name=med_name,
            dosage=med_data.get("dosage"),
            frequency=med_data.get("frequency"),
            duration=med_data.get("duration"),
            instructions=med_data.get("usage_instructions"),
        )
        db.add(prescription_medicine)

        saved_medicines.append(med_data)

        # Record in history
        record_medicine_history(user_id, med_name, "prescription", db, existing_medicine.id)

    db.commit()

    return {
        "success": True,
        "prescription_id": prescription.id,
        "doctor_name": data.get("doctor_name"),
        "hospital_name": data.get("hospital_name"),
        "medicines_count": len(saved_medicines),
        "medicines": saved_medicines
    }


@router.get("/")
async def get_prescriptions(
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    """Get all prescriptions for the current user."""
    if not authorization:
        raise HTTPException(status_code=401, detail="Authentication required")

    token = authorization.replace("Bearer ", "")
    user_id = get_current_user_id(token)

    prescriptions = db.query(Prescription).filter(
        Prescription.user_id == user_id
    ).order_by(Prescription.created_at.desc()).all()

    result = []
    for p in prescriptions:
        medicines = []
        for pm in p.medicines:
            medicines.append({
                "medicine_name": pm.medicine_name,
                "dosage": pm.dosage,
                "frequency": pm.frequency,
                "duration": pm.duration,
                "instructions": pm.instructions,
            })

        result.append({
            "id": p.id,
            "doctor_name": p.doctor_name,
            "hospital_name": p.hospital_name,
            "prescription_date": p.prescription_date.isoformat() if p.prescription_date else None,
            "medicines_count": len(medicines),
            "medicines": medicines,
            "created_at": p.created_at.isoformat() if p.created_at else None
        })

    return {"prescriptions": result}


@router.get("/{prescription_id}")
async def get_prescription(
    prescription_id: int,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    """Get a specific prescription by ID."""
    if not authorization:
        raise HTTPException(status_code=401, detail="Authentication required")

    token = authorization.replace("Bearer ", "")
    user_id = get_current_user_id(token)

    prescription = db.query(Prescription).filter(
        Prescription.id == prescription_id,
        Prescription.user_id == user_id
    ).first()

    if not prescription:
        raise HTTPException(status_code=404, detail="Prescription not found")

    medicines = []
    for pm in prescription.medicines:
        med_info = None
        if pm.medicine_id:
            medicine = db.query(Medicine).filter(Medicine.id == pm.medicine_id).first()
            if medicine:
                med_info = {
                    "medicine_name": medicine.name,
                    "manufacturer": medicine.manufacturer,
                    "composition": medicine.composition,
                    "usage": medicine.usage,
                    "dosage": medicine.dosage,
                    "side_effects": medicine.side_effects,
                    "precautions": medicine.precautions,
                    "suitable_age_range": medicine.suitable_age_range,
                    "missed_dose_guidelines": medicine.missed_dose_guidelines,
                    "usage_instructions": medicine.usage_instructions,
                    "medical_terms_explanation": medicine.medical_terms_explanation,
                }

        medicines.append({
            "medicine_name": pm.medicine_name,
            "dosage": pm.dosage,
            "frequency": pm.frequency,
            "duration": pm.duration,
            "instructions": pm.instructions,
            "detailed_info": med_info
        })

    return {
        "id": prescription.id,
        "doctor_name": prescription.doctor_name,
        "hospital_name": prescription.hospital_name,
        "extracted_data": prescription.extracted_data,
        "medicines": medicines,
        "created_at": prescription.created_at.isoformat() if prescription.created_at else None
    }
