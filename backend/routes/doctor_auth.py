"""
Doctor Auth routes — registration, login, profile management.
Role: doctor
JWT payload includes role='doctor'
"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from pydantic import BaseModel
import bcrypt
from database import get_db
from models.doctor import Doctor
from routes.auth import create_access_token, get_current_user_id, verify_token

router = APIRouter(prefix="/doctor", tags=["Doctor"])
security = HTTPBearer()


class DoctorRegister(BaseModel):
    name: str
    email: str
    password: str
    specialization: str
    domain: str = "allopathy"
    license_number: str | None = None
    phone: str | None = None
    clinic_name: str | None = None
    clinic_address: str | None = None
    bio: str | None = None
    consultation_fee: float = 0.0


class DoctorLogin(BaseModel):
    email: str
    password: str


class DoctorUpdate(BaseModel):
    name: str | None = None
    phone: str | None = None
    specialization: str | None = None
    domain: str | None = None
    clinic_name: str | None = None
    clinic_address: str | None = None
    bio: str | None = None
    consultation_fee: float | None = None
    is_available: bool | None = None


def get_current_doctor(
    auth: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> Doctor:
    """Dependency — validates JWT and returns doctor object."""
    payload = verify_token(auth.credentials)
    if not payload or payload.get("role") != "doctor":
        raise HTTPException(status_code=403, detail="Doctor access required")
    doctor = db.query(Doctor).filter(Doctor.id == payload.get("doctor_id")).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    return doctor


@router.post("/register", status_code=201)
async def register_doctor(data: DoctorRegister, db: Session = Depends(get_db)):
    existing = db.query(Doctor).filter(Doctor.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(data.password.encode("utf-8"), salt).decode("utf-8")

    doctor = Doctor(
        name=data.name,
        email=data.email,
        password_hash=hashed,
        phone=data.phone,
        specialization=data.specialization,
        domain=data.domain,
        license_number=data.license_number,
        clinic_name=data.clinic_name,
        clinic_address=data.clinic_address,
        bio=data.bio,
        consultation_fee=data.consultation_fee,
    )
    db.add(doctor)
    db.commit()
    db.refresh(doctor)

    token = create_access_token({
        "doctor_id": doctor.id,
        "email": doctor.email,
        "role": "doctor"
    })
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": _doctor_dict(doctor),
        "role": "doctor"
    }


@router.post("/login")
async def login_doctor(data: DoctorLogin, db: Session = Depends(get_db)):
    doctor = db.query(Doctor).filter(Doctor.email == data.email).first()
    valid = False
    if doctor and doctor.password_hash:
        try:
            valid = bcrypt.checkpw(data.password.encode("utf-8"), doctor.password_hash.encode("utf-8"))
        except ValueError:
            pass

    if not valid:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({
        "doctor_id": doctor.id,
        "email": doctor.email,
        "role": "doctor"
    })
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": _doctor_dict(doctor),
        "role": "doctor"
    }


@router.get("/profile")
async def get_profile(doctor: Doctor = Depends(get_current_doctor)):
    return _doctor_dict(doctor)


@router.put("/profile")
async def update_profile(
    data: DoctorUpdate,
    doctor: Doctor = Depends(get_current_doctor),
    db: Session = Depends(get_db)
):
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(doctor, field, value)
    db.commit()
    return {"message": "Profile updated", "doctor": _doctor_dict(doctor)}


@router.get("/patients")
async def get_patients(
    doctor: Doctor = Depends(get_current_doctor),
    db: Session = Depends(get_db)
):
    """List all patients who booked appointments with this doctor."""
    from models.appointment import Appointment
    from models.user import User

    appts = db.query(Appointment).filter(
        Appointment.doctor_id == doctor.id
    ).order_by(Appointment.appointment_date.desc()).all()

    patient_ids = list({a.patient_id for a in appts})
    patients = db.query(User).filter(User.id.in_(patient_ids)).all()

    return [
        {
            "id": p.id,
            "name": p.name,
            "email": p.email,
            "age": p.age,
            "phone": p.phone,
            "total_appointments": sum(1 for a in appts if a.patient_id == p.id),
        }
        for p in patients
    ]


@router.get("/appointments")
async def get_doctor_appointments(
    doctor: Doctor = Depends(get_current_doctor),
    db: Session = Depends(get_db)
):
    from models.appointment import Appointment
    from models.user import User

    appts = db.query(Appointment).filter(
        Appointment.doctor_id == doctor.id
    ).order_by(Appointment.appointment_date, Appointment.appointment_time).all()

    result = []
    for a in appts:
        patient = db.query(User).filter(User.id == a.patient_id).first()
        result.append({
            "id": a.id,
            "patient_name": patient.name if patient else "Unknown",
            "patient_email": patient.email if patient else "",
            "appointment_date": str(a.appointment_date),
            "appointment_time": a.appointment_time,
            "status": a.status,
            "concern_domain": a.concern_domain,
            "consultation_type": a.consultation_type,
            "symptoms": a.symptoms,
        })
    return result


@router.get("/all")
async def list_all_doctors(
    domain: str | None = None,
    specialization: str | None = None,
    db: Session = Depends(get_db)
):
    """Public endpoint — list available doctors (for patient search)."""
    query = db.query(Doctor).filter(Doctor.is_available == True)
    if domain:
        query = query.filter(Doctor.domain == domain.lower())
    if specialization:
        query = query.filter(Doctor.specialization.ilike(f"%{specialization}%"))
    doctors = query.all()
    return [_doctor_dict(d, public=True) for d in doctors]


def _doctor_dict(d: Doctor, public: bool = False) -> dict:
    result = {
        "id": d.id,
        "name": d.name,
        "email": d.email,
        "phone": d.phone,
        "specialization": d.specialization,
        "domain": d.domain,
        "clinic_name": d.clinic_name,
        "clinic_address": d.clinic_address,
        "bio": d.bio,
        "consultation_fee": d.consultation_fee,
        "consultation_types": d.consultation_types.split(",") if d.consultation_types else ["chat"],
        "is_verified": d.is_verified,
        "is_available": d.is_available,
        "rating": d.rating,
        "total_consultations": d.total_consultations,
        "organization_id": d.organization_id,
        "role": "doctor",
    }
    if not public:
        result["license_number"] = d.license_number
    return result
