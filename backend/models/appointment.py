"""
Appointment model for patient-doctor booking system.
"""
from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, Text, Date, Time
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    patient_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    doctor_id = Column(Integer, ForeignKey("doctors.id"), nullable=False)

    appointment_date = Column(Date, nullable=False)
    appointment_time = Column(String(10), nullable=False)  # "10:30" format
    status = Column(String(20), default="pending")  # pending/confirmed/completed/cancelled
    concern_domain = Column(String(50), nullable=True)  # allopathy/ayurvedic/homeopathy
    consultation_type = Column(String(20), default="chat")  # video/chat/in-person

    symptoms = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)

    # Filled after consultation
    prescription_id = Column(Integer, ForeignKey("prescriptions.id"), nullable=True)
    doctor_notes = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    patient = relationship("User", back_populates="appointments")
    doctor = relationship("Doctor", back_populates="appointments")
