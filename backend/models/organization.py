"""
Organization & Subscription models for B2B platform.
"""
from sqlalchemy import Column, Integer, String, DateTime, Boolean, Float, JSON, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class SubscriptionPlan(Base):
    __tablename__ = "subscription_plans"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(50), nullable=False, unique=True)  # basic/professional/enterprise
    price_monthly = Column(Float, default=0.0)
    price_yearly = Column(Float, default=0.0)
    max_patients = Column(Integer, default=50)
    max_doctors = Column(Integer, default=5)
    features = Column(JSON, nullable=True)  # list of feature strings
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Organization(Base):
    __tablename__ = "organizations"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(200), nullable=False)
    org_type = Column(String(50), nullable=False, default="clinic")  # hospital/clinic/pharmacy/corporate/ngo
    email = Column(String(255), unique=True, nullable=False, index=True)
    phone = Column(String(20), nullable=True)
    address = Column(Text, nullable=True)
    logo_url = Column(String(500), nullable=True)

    # Subscription
    subscription_plan = Column(String(50), default="basic")  # basic/professional/enterprise
    subscription_start = Column(DateTime(timezone=True), nullable=True)
    subscription_end = Column(DateTime(timezone=True), nullable=True)
    max_patients = Column(Integer, default=50)
    max_doctors = Column(Integer, default=5)
    api_key = Column(String(64), unique=True, nullable=True)  # for white-label API

    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    doctors = relationship("Doctor", back_populates="organization")
