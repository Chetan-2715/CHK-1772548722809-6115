from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class Medicine(Base):
    __tablename__ = "medicines"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(300), nullable=False, index=True)
    barcode = Column(String(100), nullable=True, unique=True, index=True)
    manufacturer = Column(String(300), nullable=True)
    composition = Column(Text, nullable=True)
    usage = Column(Text, nullable=True)
    dosage = Column(Text, nullable=True)
    side_effects = Column(Text, nullable=True)
    precautions = Column(Text, nullable=True)
    suitable_age_range = Column(Text, nullable=True)
    missed_dose_guidelines = Column(Text, nullable=True)
    usage_instructions = Column(Text, nullable=True)
    medical_terms_explanation = Column(JSON, nullable=True)
    image_url = Column(Text, nullable=True)
    category = Column(String(200), nullable=True)
    price = Column(String(50), nullable=True)
    source = Column(String(50), default="gemini")  # "database", "gemini", "jan_aushadhi"
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class MedicineHistory(Base):
    __tablename__ = "medicine_history"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    medicine_id = Column(Integer, nullable=True)
    medicine_name = Column(String(300), nullable=False)
    action = Column(String(50), nullable=False)  # "search", "scan", "verify", "prescription"
    details = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="medicine_history")
