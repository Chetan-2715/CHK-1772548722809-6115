"""
Organization routes — B2B registration, subscription, and admin dashboard.
"""
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from pydantic import BaseModel
import secrets
from database import get_db
from models.organization import Organization
from models.doctor import Doctor
from models.user import User
from routes.auth import verify_token

router = APIRouter(prefix="/org", tags=["Organization"])
security = HTTPBearer()

SUBSCRIPTION_PLANS = {
    "basic": {
        "name": "Basic",
        "price_monthly": 999,
        "price_yearly": 9990,
        "max_patients": 50,
        "max_doctors": 3,
        "features": [
            "Up to 50 patients",
            "Up to 3 doctors",
            "Prescription scanning",
            "Medicine verification",
            "Email support"
        ]
    },
    "professional": {
        "name": "Professional",
        "price_monthly": 4999,
        "price_yearly": 49990,
        "max_patients": 500,
        "max_doctors": 20,
        "features": [
            "Up to 500 patients",
            "Up to 20 doctors",
            "Everything in Basic",
            "Appointment booking",
            "Analytics dashboard",
            "Bulk patient CSV upload",
            "Priority support"
        ]
    },
    "enterprise": {
        "name": "Enterprise",
        "price_monthly": 0,
        "price_yearly": 0,
        "max_patients": 999999,
        "max_doctors": 999999,
        "features": [
            "Unlimited patients & doctors",
            "Everything in Professional",
            "White-label API access",
            "Custom integrations",
            "Dedicated account manager",
            "SLA guarantee",
            "HIPAA compliance package"
        ]
    }
}


class OrgRegister(BaseModel):
    name: str
    email: str
    phone: str | None = None
    address: str | None = None
    org_type: str = "clinic"
    subscription_plan: str = "basic"


class OrgSubscribe(BaseModel):
    plan: str  # basic/professional/enterprise


def _require_org_admin(auth: HTTPAuthorizationCredentials, db: Session):
    payload = verify_token(auth.credentials)
    if not payload or payload.get("role") != "org_admin":
        raise HTTPException(status_code=403, detail="Organization admin access required")
    return payload


@router.post("/register", status_code=201)
async def register_org(data: OrgRegister, db: Session = Depends(get_db)):
    existing = db.query(Organization).filter(Organization.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Organization email already registered")

    if data.subscription_plan not in SUBSCRIPTION_PLANS:
        raise HTTPException(status_code=400, detail="Invalid subscription plan")

    plan_details = SUBSCRIPTION_PLANS[data.subscription_plan]
    api_key = secrets.token_hex(32)

    org = Organization(
        name=data.name,
        email=data.email,
        phone=data.phone,
        address=data.address,
        org_type=data.org_type,
        subscription_plan=data.subscription_plan,
        max_patients=plan_details["max_patients"],
        max_doctors=plan_details["max_doctors"],
        api_key=api_key,
        is_active=True,
    )
    db.add(org)
    db.commit()
    db.refresh(org)

    return {
        "id": org.id,
        "name": org.name,
        "email": org.email,
        "subscription_plan": org.subscription_plan,
        "api_key": api_key,
        "message": f"Organization registered successfully on {data.subscription_plan} plan!"
    }


@router.get("/plans")
async def get_plans():
    """Public endpoint — returns all subscription plans."""
    return SUBSCRIPTION_PLANS


@router.post("/subscribe")
async def update_subscription(
    data: OrgSubscribe,
    auth: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    payload = _require_org_admin(auth, db)
    org_id = payload.get("org_id")
    org = db.query(Organization).filter(Organization.id == org_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")

    if data.plan not in SUBSCRIPTION_PLANS:
        raise HTTPException(status_code=400, detail="Invalid plan")

    plan = SUBSCRIPTION_PLANS[data.plan]
    org.subscription_plan = data.plan
    org.max_patients = plan["max_patients"]
    org.max_doctors = plan["max_doctors"]
    db.commit()

    return {"message": f"Subscription updated to {data.plan}", "features": plan["features"]}


@router.get("/dashboard")
async def org_dashboard(
    auth: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    payload = _require_org_admin(auth, db)
    org_id = payload.get("org_id")
    org = db.query(Organization).filter(Organization.id == org_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")

    doctors = db.query(Doctor).filter(Doctor.organization_id == org_id).all()
    patients = db.query(User).filter(User.organization_id == org_id).all()

    return {
        "organization": {
            "id": org.id,
            "name": org.name,
            "org_type": org.org_type,
            "subscription_plan": org.subscription_plan,
            "max_patients": org.max_patients,
            "max_doctors": org.max_doctors,
            "is_active": org.is_active,
        },
        "stats": {
            "total_doctors": len(doctors),
            "total_patients": len(patients),
            "slots_used_doctors": f"{len(doctors)}/{org.max_doctors}",
            "slots_used_patients": f"{len(patients)}/{org.max_patients}",
        },
        "doctors": [
            {"id": d.id, "name": d.name, "specialization": d.specialization, "domain": d.domain,
             "is_available": d.is_available, "total_consultations": d.total_consultations}
            for d in doctors
        ],
        "patients": [
            {"id": p.id, "name": p.name, "email": p.email, "age": p.age}
            for p in patients
        ]
    }


@router.post("/add-doctor")
async def add_doctor_to_org(
    doctor_email: str,
    auth: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    payload = _require_org_admin(auth, db)
    org_id = payload.get("org_id")
    org = db.query(Organization).filter(Organization.id == org_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")

    doctor = db.query(Doctor).filter(Doctor.email == doctor_email).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found — they must register first")

    current_doctors = db.query(Doctor).filter(Doctor.organization_id == org_id).count()
    if current_doctors >= org.max_doctors:
        raise HTTPException(status_code=400, detail=f"Doctor limit reached ({org.max_doctors}). Upgrade plan.")

    doctor.organization_id = org_id
    db.commit()
    return {"message": f"Dr. {doctor.name} added to {org.name}"}
