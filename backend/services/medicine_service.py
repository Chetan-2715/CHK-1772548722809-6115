"""
Medicine service for handling medicine lookups, verification, and history.
"""
from sqlalchemy.orm import Session
from sqlalchemy import or_
from models.medicine import Medicine, MedicineHistory
from models.prescription import Prescription, PrescriptionMedicine
from services.gemini_service import get_medicine_info, identify_tablet_from_image, compare_compositions


async def search_medicine(name: str, db: Session) -> dict:
    """
    Search for a medicine by name.
    1. Check database first
    2. If not found, use Gemini API and store result
    """
    # Search in database (case-insensitive partial match)
    medicine = db.query(Medicine).filter(
        or_(
            Medicine.name.ilike(f"%{name}%"),
            Medicine.composition.ilike(f"%{name}%")
        )
    ).first()

    if medicine:
        return {
            "success": True,
            "source": "database",
            "data": medicine_to_dict(medicine)
        }

    # Use Gemini API
    gemini_result = await get_medicine_info(name)

    if not gemini_result["success"]:
        return gemini_result

    data = gemini_result["data"]

    # Store in database for future queries
    new_medicine = Medicine(
        name=data.get("medicine_name", name),
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
        print(f"Error storing medicine: {e}")

    return {
        "success": True,
        "source": "gemini",
        "data": data
    }


async def verify_tablet(
    user_id: int,
    medicine_name: str,
    db: Session,
    image_bytes: bytes = None,
    mime_type: str = "image/jpeg",
    barcode: str = None
) -> dict:
    """
    Verify a tablet against user's prescriptions.

    Cases:
    1. Tablet exists in prescription → confirmation
    2. Tablet NOT in prescription but similar composition → replacement suggestion
    3. Tablet NOT in prescription and different → warning
    """
    identified_name = medicine_name

    # If image provided, identify the tablet first
    if image_bytes:
        id_result = await identify_tablet_from_image(image_bytes, mime_type)
        if id_result["success"]:
            identified_name = id_result["data"].get("identified_medicine", medicine_name)

    # If barcode provided, look up by barcode
    if barcode:
        barcode_medicine = db.query(Medicine).filter(Medicine.barcode == barcode).first()
        if barcode_medicine:
            identified_name = barcode_medicine.name

    # Get user's prescription medicines
    prescriptions = db.query(Prescription).filter(Prescription.user_id == user_id).all()
    prescription_medicines = []
    for prescription in prescriptions:
        for pm in prescription.medicines:
            prescription_medicines.append(pm)

    # Check if the identified medicine is in any prescription
    found_in_prescription = False
    matching_prescription_medicine = None

    for pm in prescription_medicines:
        if pm.medicine_name.lower().strip() in identified_name.lower().strip() or \
           identified_name.lower().strip() in pm.medicine_name.lower().strip():
            found_in_prescription = True
            matching_prescription_medicine = pm
            break

    if found_in_prescription:
        return {
            "success": True,
            "status": "confirmed",
            "message": f"✅ '{identified_name}' is found in your prescription.",
            "prescription_details": {
                "medicine_name": matching_prescription_medicine.medicine_name,
                "dosage": matching_prescription_medicine.dosage,
                "frequency": matching_prescription_medicine.frequency,
                "duration": matching_prescription_medicine.duration,
                "instructions": matching_prescription_medicine.instructions
            }
        }

    # Not found in prescription — check composition similarity
    # Get composition of the identified medicine
    identified_medicine_info = await search_medicine(identified_name, db)
    identified_composition = ""
    if identified_medicine_info["success"]:
        identified_composition = identified_medicine_info["data"].get("composition", "")

    # Compare with prescription medicines
    if identified_composition and prescription_medicines:
        for pm in prescription_medicines:
            pm_medicine = db.query(Medicine).filter(
                Medicine.name.ilike(f"%{pm.medicine_name}%")
            ).first()

            if pm_medicine and pm_medicine.composition:
                comparison = await compare_compositions(
                    identified_composition,
                    pm_medicine.composition
                )

                if comparison["success"] and comparison["data"].get("are_similar", False):
                    return {
                        "success": True,
                        "status": "replacement",
                        "message": f"⚠️ '{identified_name}' is NOT in your prescription, but it has a similar composition to '{pm.medicine_name}'.",
                        "comparison": comparison["data"],
                        "prescription_medicine": pm.medicine_name,
                        "identified_medicine": identified_name
                    }

    # Not similar to anything in prescription
    return {
        "success": True,
        "status": "warning",
        "message": f"❌ '{identified_name}' is NOT in your prescription and does not match any prescribed medicine. Please consult your doctor.",
        "identified_medicine": identified_name,
        "medicine_info": identified_medicine_info.get("data") if identified_medicine_info["success"] else None
    }


def record_medicine_history(
    user_id: int,
    medicine_name: str,
    action: str,
    db: Session,
    medicine_id: int = None,
    details: dict = None
):
    """Record a medicine interaction in user's history."""
    history = MedicineHistory(
        user_id=user_id,
        medicine_id=medicine_id,
        medicine_name=medicine_name,
        action=action,
        details=details
    )
    try:
        db.add(history)
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"Error recording history: {e}")


def get_user_medicine_history(user_id: int, db: Session, limit: int = 50):
    """Get user's medicine interaction history."""
    history = db.query(MedicineHistory).filter(
        MedicineHistory.user_id == user_id
    ).order_by(MedicineHistory.created_at.desc()).limit(limit).all()

    return [
        {
            "id": h.id,
            "medicine_name": h.medicine_name,
            "action": h.action,
            "details": h.details,
            "created_at": h.created_at.isoformat() if h.created_at else None
        }
        for h in history
    ]


def medicine_to_dict(medicine: Medicine) -> dict:
    """Convert a Medicine model to a dictionary."""
    return {
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
        "source": medicine.source,
    }
