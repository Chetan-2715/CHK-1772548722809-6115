"""
Appointments routes — patient books doctor, doctor manages schedule.
"""
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import date
from database import get_db
from models.appointment import Appointment
from models.doctor import Doctor
from models.user import User
from routes.auth import verify_token, get_current_user_id

router = APIRouter(prefix="/appointments", tags=["Appointments"])
security = HTTPBearer()


class AppointmentCreate(BaseModel):
    doctor_id: int
    appointment_date: str   # "YYYY-MM-DD"
    appointment_time: str   # "10:30"
    consultation_type: str = "chat"
    symptoms: str | None = None


class AppointmentUpdate(BaseModel):
    status: str | None = None
    doctor_notes: str | None = None


def _get_user_from_token(auth: HTTPAuthorizationCredentials, db: Session):
    payload = verify_token(auth.credentials)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    role = payload.get("role", "patient")
    if role == "doctor":
        return None, payload.get("doctor_id"), role
    user_id = payload.get("user_id")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user, user_id, role


@router.post("/book", status_code=201)
async def book_appointment(
    data: AppointmentCreate,
    auth: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Patient books an appointment with a doctor."""
    user, user_id, role = _get_user_from_token(auth, db)
    if role == "doctor":
        raise HTTPException(status_code=403, detail="Doctors cannot book appointments")

    doctor = db.query(Doctor).filter(Doctor.id == data.doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    if not doctor.is_available:
        raise HTTPException(status_code=400, detail="Doctor is currently unavailable")

    from datetime import date as date_type
    appt_date = date_type.fromisoformat(data.appointment_date)

    appt = Appointment(
        patient_id=user_id,
        doctor_id=data.doctor_id,
        appointment_date=appt_date,
        appointment_time=data.appointment_time,
        consultation_type=data.consultation_type,
        symptoms=data.symptoms,
        concern_domain=doctor.domain,
        status="pending",
    )
    db.add(appt)
    db.commit()
    db.refresh(appt)

    return {
        "id": appt.id,
        "doctor_name": doctor.name,
        "doctor_specialization": doctor.specialization,
        "appointment_date": str(appt.appointment_date),
        "appointment_time": appt.appointment_time,
        "status": appt.status,
        "consultation_type": appt.consultation_type,
        "message": "Appointment booked successfully! Doctor will confirm shortly."
    }


@router.get("/my")
async def my_appointments(
    auth: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Patient's own appointments list."""
    payload = verify_token(auth.credentials)
    if not payload or payload.get("role") == "doctor":
        raise HTTPException(status_code=403, detail="Patient access only")

    user_id = payload.get("user_id")
    appts = db.query(Appointment).filter(
        Appointment.patient_id == user_id
    ).order_by(Appointment.appointment_date.desc()).all()

    result = []
    for a in appts:
        doctor = db.query(Doctor).filter(Doctor.id == a.doctor_id).first()
        result.append({
            "id": a.id,
            "doctor_name": doctor.name if doctor else "Unknown",
            "doctor_specialization": doctor.specialization if doctor else "",
            "doctor_domain": doctor.domain if doctor else "",
            "appointment_date": str(a.appointment_date),
            "appointment_time": a.appointment_time,
            "status": a.status,
            "concern_domain": a.concern_domain,
            "consultation_type": a.consultation_type,
            "symptoms": a.symptoms,
            "doctor_notes": a.doctor_notes,
        })
    return result


@router.put("/{appt_id}/confirm")
async def confirm_appointment(
    appt_id: int,
    auth: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    payload = verify_token(auth.credentials)
    if not payload or payload.get("role") != "doctor":
        raise HTTPException(status_code=403, detail="Doctor access required")

    appt = db.query(Appointment).filter(Appointment.id == appt_id).first()
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")
    if appt.doctor_id != payload.get("doctor_id"):
        raise HTTPException(status_code=403, detail="Not your appointment")

    appt.status = "confirmed"
    db.commit()
    return {"message": "Appointment confirmed", "id": appt_id}


@router.put("/{appt_id}/complete")
async def complete_appointment(
    appt_id: int,
    data: AppointmentUpdate,
    auth: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    payload = verify_token(auth.credentials)
    if not payload or payload.get("role") != "doctor":
        raise HTTPException(status_code=403, detail="Doctor access required")

    appt = db.query(Appointment).filter(Appointment.id == appt_id).first()
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")
    if appt.doctor_id != payload.get("doctor_id"):
        raise HTTPException(status_code=403, detail="Not your appointment")

    appt.status = "completed"
    if data.doctor_notes:
        appt.doctor_notes = data.doctor_notes

    # Increment doctor's total consultations
    doctor = db.query(Doctor).filter(Doctor.id == appt.doctor_id).first()
    if doctor:
        doctor.total_consultations = (doctor.total_consultations or 0) + 1

    db.commit()
    return {"message": "Appointment completed", "id": appt_id}


@router.delete("/{appt_id}")
async def cancel_appointment(
    appt_id: int,
    auth: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    payload = verify_token(auth.credentials)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")

    appt = db.query(Appointment).filter(Appointment.id == appt_id).first()
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")

    # Allow patient or the doctor to cancel
    role = payload.get("role", "patient")
    if role == "doctor" and appt.doctor_id != payload.get("doctor_id"):
        raise HTTPException(status_code=403, detail="Not your appointment")
    elif role == "patient" and appt.patient_id != payload.get("user_id"):
        raise HTTPException(status_code=403, detail="Not your appointment")

    appt.status = "cancelled"
    db.commit()
    return {"message": "Appointment cancelled"}
