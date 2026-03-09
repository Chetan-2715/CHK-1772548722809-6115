"""
Barcode scanning and lookup service.
Uses pyzbar for server-side barcode decoding (when image is uploaded).
Also provides lookup by barcode string from client-side scanning.
"""
from sqlalchemy.orm import Session
from models.medicine import Medicine
from services.gemini_service import get_medicine_info
from PIL import Image
import io


def decode_barcode_from_image(image_bytes: bytes) -> list:
    """
    Decode barcodes from an image using pyzbar.
    Returns a list of decoded barcode strings.
    """
    try:
        from pyzbar.pyzbar import decode
        image = Image.open(io.BytesIO(image_bytes))
        barcodes = decode(image)
        return [barcode.data.decode("utf-8") for barcode in barcodes]
    except ImportError:
        # pyzbar not available (missing zbar DLL on Windows)
        return []
    except Exception as e:
        print(f"Barcode decoding error: {e}")
        return []


async def lookup_by_barcode(barcode: str, db: Session) -> dict:
    """
    Look up a medicine by barcode.
    1. Check database first
    2. If not found, use Gemini API
    3. Store the result for future lookups
    """
    # Step 1: Check database
    medicine = db.query(Medicine).filter(Medicine.barcode == barcode).first()

    if medicine:
        return {
            "success": True,
            "source": "database",
            "data": {
                "id": medicine.id,
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
                "barcode": medicine.barcode,
                "category": medicine.category,
                "price": medicine.price,
            }
        }

    # Step 2: If barcode not in database, we can't determine medicine name
    # from barcode alone without an external barcode database.
    # Return not found so the frontend can prompt for manual input or image scan.
    return {
        "success": False,
        "source": "none",
        "message": "Medicine not found for this barcode. Try uploading a tablet image or searching by name.",
        "barcode": barcode
    }


async def lookup_and_store_medicine(medicine_name: str, barcode: str, db: Session) -> dict:
    """
    Look up medicine info via Gemini and store it in the database with the barcode.
    """
    # Check if medicine already exists by name
    existing = db.query(Medicine).filter(Medicine.name.ilike(f"%{medicine_name}%")).first()

    if existing:
        # Update barcode if not set
        if barcode and not existing.barcode:
            existing.barcode = barcode
            db.commit()
        return {
            "success": True,
            "source": "database",
            "data": {
                "id": existing.id,
                "medicine_name": existing.name,
                "manufacturer": existing.manufacturer,
                "composition": existing.composition,
                "usage": existing.usage,
                "dosage": existing.dosage,
                "side_effects": existing.side_effects,
                "precautions": existing.precautions,
                "suitable_age_range": existing.suitable_age_range,
                "missed_dose_guidelines": existing.missed_dose_guidelines,
                "usage_instructions": existing.usage_instructions,
                "medical_terms_explanation": existing.medical_terms_explanation,
                "barcode": existing.barcode,
                "category": existing.category,
                "price": existing.price,
            }
        }

    # Use Gemini to get info
    gemini_result = await get_medicine_info(medicine_name)

    if not gemini_result["success"]:
        return gemini_result

    data = gemini_result["data"]

    # Store in database
    new_medicine = Medicine(
        name=data.get("medicine_name", medicine_name),
        barcode=barcode if barcode else None,
        manufacturer=data.get("manufacturer"),
        composition=data.get("composition"),
        usage=data.get("usage"),
        dosage=data.get("dosage"),
        side_effects=data.get("side_effects"),
        precautions=data.get("precautions"),
        suitable_age_range=data.get("suitable_age_range"),
        missed_dose_guidelines=data.get("missed_dose_guidelines"),
        usage_instructions=data.get("usage_instructions"),
        medical_terms_explanation=data.get("medical_terms_explanation"),
        category=data.get("category"),
        source="gemini"
    )

    try:
        db.add(new_medicine)
        db.commit()
        db.refresh(new_medicine)
        data["id"] = new_medicine.id
    except Exception as e:
        db.rollback()
        print(f"Database storage error: {e}")

    return {
        "success": True,
        "source": "gemini",
        "data": data
    }
