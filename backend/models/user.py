from sqlalchemy import Column, Integer, String, DateTime, Boolean, JSON, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    age = Column(Integer, nullable=True)
    phone = Column(String(20), nullable=True)

    # Role-based access: patient | doctor | pharmacist | org_admin
    role = Column(String(20), default="patient", nullable=False)

    # B2B org link (nullable — independent patients don't belong to any org)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=True)

    accessibility_large_font = Column(Boolean, default=False)
    accessibility_high_contrast = Column(Boolean, default=False)
    accessibility_voice = Column(Boolean, default=False)
    medical_profile = Column(JSON, nullable=True)
    caretaker_name = Column(String(100), nullable=True)
    caretaker_email = Column(String(255), nullable=True)
    caretaker_phone = Column(String(20), nullable=True)
    caretaker_relation = Column(String(50), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    prescriptions = relationship("Prescription", back_populates="user", cascade="all, delete-orphan")
    reminders = relationship("Reminder", back_populates="user", cascade="all, delete-orphan")
    medicine_history = relationship("MedicineHistory", back_populates="user", cascade="all, delete-orphan")
    appointments = relationship("Appointment", back_populates="patient", cascade="all, delete-orphan")

