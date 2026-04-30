"""
Doctor model for B2B platform — physician portal.
"""
from sqlalchemy import Column, Integer, String, DateTime, Boolean, Float, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class Doctor(Base):
    __tablename__ = "doctors"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    phone = Column(String(20), nullable=True)

    # Professional details
    specialization = Column(String(100), nullable=False)
    license_number = Column(String(100), nullable=True, unique=True)
    domain = Column(String(50), nullable=False, default="allopathy")  # allopathy/ayurvedic/homeopathy
    clinic_name = Column(String(200), nullable=True)
    clinic_address = Column(Text, nullable=True)
    bio = Column(Text, nullable=True)

    # Consultation settings
    consultation_fee = Column(Float, default=0.0)
    consultation_types = Column(String(100), default="chat,in-person")  # comma-separated

    # Status
    is_verified = Column(Boolean, default=False)
    is_available = Column(Boolean, default=True)
    rating = Column(Float, default=5.0)
    total_consultations = Column(Integer, default=0)

    # B2B org link
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    appointments = relationship("Appointment", back_populates="doctor")
    organization = relationship("Organization", back_populates="doctors")
