"""
Authentication routes for user registration and login.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
import os
from database import get_db
from models.user import User

router = APIRouter(prefix="/auth", tags=["Authentication"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

SECRET_KEY = os.getenv("SECRET_KEY", "mediscribe-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440  # 24 hours


class UserRegister(BaseModel):
    name: str
    email: str
    password: str
    age: int | None = None
    phone: str | None = None


class UserLogin(BaseModel):
    email: str
    password: str


class UserUpdate(BaseModel):
    name: str | None = None
    age: int | None = None
    phone: str | None = None
    accessibility_large_font: bool | None = None
    accessibility_high_contrast: bool | None = None
    accessibility_voice: bool | None = None


class Token(BaseModel):
    access_token: str
    token_type: str
    user: dict


def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None


def get_current_user_id(token: str) -> int:
    payload = verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    return payload.get("user_id")


@router.post("/register")
async def register(user_data: UserRegister, db: Session = Depends(get_db)):
    # Check if user exists
    existing = db.query(User).filter(User.email == user_data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = pwd_context.hash(user_data.password)
    new_user = User(
        name=user_data.name,
        email=user_data.email,
        password_hash=hashed_password,
        age=user_data.age,
        phone=user_data.phone
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = create_access_token({"user_id": new_user.id, "email": new_user.email})

    return Token(
        access_token=token,
        token_type="bearer",
        user={
            "id": new_user.id,
            "name": new_user.name,
            "email": new_user.email,
            "age": new_user.age,
        }
    )


@router.post("/login")
async def login(user_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_data.email).first()
    if not user or not pwd_context.verify(user_data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"user_id": user.id, "email": user.email})

    return Token(
        access_token=token,
        token_type="bearer",
        user={
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "age": user.age,
            "accessibility_large_font": user.accessibility_large_font,
            "accessibility_high_contrast": user.accessibility_high_contrast,
            "accessibility_voice": user.accessibility_voice,
        }
    )


@router.put("/profile")
async def update_profile(
    user_update: UserUpdate,
    token: str = None,
    db: Session = Depends(get_db)
):
    if not token:
        raise HTTPException(status_code=401, detail="Authentication required")

    user_id = get_current_user_id(token)
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user_update.name is not None:
        user.name = user_update.name
    if user_update.age is not None:
        user.age = user_update.age
    if user_update.phone is not None:
        user.phone = user_update.phone
    if user_update.accessibility_large_font is not None:
        user.accessibility_large_font = user_update.accessibility_large_font
    if user_update.accessibility_high_contrast is not None:
        user.accessibility_high_contrast = user_update.accessibility_high_contrast
    if user_update.accessibility_voice is not None:
        user.accessibility_voice = user_update.accessibility_voice

    db.commit()
    return {"message": "Profile updated successfully"}
