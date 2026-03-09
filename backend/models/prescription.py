from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class Prescription(Base):
    __tablename__ = "prescriptions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    image_url = Column(Text, nullable=True)
    raw_text = Column(Text, nullable=True)
    extracted_data = Column(JSON, nullable=True)
    doctor_name = Column(String(200), nullable=True)
    hospital_name = Column(String(300), nullable=True)
    prescription_date = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="prescriptions")
    medicines = relationship("PrescriptionMedicine", back_populates="prescription", cascade="all, delete-orphan")


class PrescriptionMedicine(Base):
    __tablename__ = "prescription_medicines"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    prescription_id = Column(Integer, ForeignKey("prescriptions.id", ondelete="CASCADE"), nullable=False)
    medicine_id = Column(Integer, ForeignKey("medicines.id", ondelete="SET NULL"), nullable=True)
    medicine_name = Column(String(300), nullable=False)
    dosage = Column(String(200), nullable=True)
    frequency = Column(String(200), nullable=True)
    duration = Column(String(200), nullable=True)
    instructions = Column(Text, nullable=True)

    prescription = relationship("Prescription", back_populates="medicines")
    medicine = relationship("Medicine")
