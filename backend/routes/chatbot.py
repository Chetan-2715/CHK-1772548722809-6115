"""
Chatbot route – AI health assistant with full user context.
"""
from fastapi import APIRouter, Depends, HTTPException, Header, UploadFile, File, Form
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from database import get_db
from routes.auth import get_current_user_id
from models.user import User
from models.prescription import Prescription, PrescriptionMedicine
from models.medicine import MedicineHistory
from models.reminder import Reminder
from services.gemini_service import get_text_model, get_language_instruction

router = APIRouter(prefix="/chatbot", tags=["Chatbot"])


class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str


class ChatRequest(BaseModel):
    message: str
    history: List[ChatMessage] = []


def build_user_context(user: User, db: Session) -> str:
    """Build a rich context string from the user's medical data."""
    parts = []

    # Basic info
    parts.append(f"Patient Name: {user.name}, Age: {user.age or 'Unknown'}, Phone: {user.phone or 'N/A'}")

    # Medical profile
    if user.medical_profile:
        mp = user.medical_profile
        parts.append(f"Medical Profile: {', '.join(f'{k}: {v}' for k, v in mp.items() if v)}")

    # Caretaker
    if user.caretaker_name:
        parts.append(f"Caretaker: {user.caretaker_name} ({user.caretaker_relation or 'relation unknown'}), Phone: {user.caretaker_phone or 'N/A'}")

    # Prescriptions & medicines
    prescriptions = db.query(Prescription).filter(Prescription.user_id == user.id).order_by(Prescription.created_at.desc()).limit(5).all()
    if prescriptions:
        med_lines = []
        for p in prescriptions:
            doctor = p.doctor_name or "Unknown Doctor"
            for pm in p.medicines:
                med_lines.append(
                    f"- {pm.medicine_name} (Dosage: {pm.dosage or 'N/A'}, Frequency: {pm.frequency or 'N/A'}, Duration: {pm.duration or 'N/A'}, Instructions: {pm.instructions or 'N/A'}) prescribed by {doctor}"
                )
        if med_lines:
            parts.append("Current/Recent Prescribed Medicines:\n" + "\n".join(med_lines))

    # Reminders
    reminders = db.query(Reminder).filter(Reminder.user_id == user.id, Reminder.is_active == True).all()
    if reminders:
        rem_lines = [f"- {r.medicine_name} at {r.reminder_time} ({r.frequency})" for r in reminders]
        parts.append("Active Reminders:\n" + "\n".join(rem_lines))

    # Recent medicine lookups
    history = db.query(MedicineHistory).filter(MedicineHistory.user_id == user.id).order_by(MedicineHistory.created_at.desc()).limit(10).all()
    if history:
        hist_lines = [f"- {h.medicine_name} ({h.action})" for h in history]
        parts.append("Recent Medicine Lookups:\n" + "\n".join(hist_lines))

    return "\n\n".join(parts)


@router.post("/chat")
async def chat(
    request: ChatRequest,
    accept_language: str = Header("en"),
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    """AI Chatbot with full user medical context."""
    if not authorization:
        raise HTTPException(status_code=401, detail="Authentication required")

    token = authorization.replace("Bearer ", "")
    user_id = get_current_user_id(token)

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Build context
    user_context = build_user_context(user, db)

    lang_instruction = get_language_instruction(accept_language)

    system_prompt = f"""You are a warm, caring AI health assistant for "Scan4Elders", an app designed for elderly users.

YOUR ROLE:
- Answer health and medication related questions clearly and simply
- Provide emotional support and reassurance 
- Help users understand their prescriptions and medicines
- Remind them about dosages, side effects, and precautions
- Be empathetic, patient, and use simple language
- If the user seems anxious or worried, provide comfort and encouragement
- NEVER diagnose conditions or replace a doctor's advice - always recommend consulting their doctor for serious concerns

PATIENT CONTEXT (use this to personalize answers):
{user_context}

IMPORTANT RULES:
- Keep answers concise (2-4 sentences for simple questions, longer for complex ones)
- Use warm, friendly language like talking to a beloved grandparent
- If asked about a medicine they are prescribed, reference their prescription data
- If they mention feeling lonely, sad, or anxious, provide emotional support first before answering medical questions
- Always end serious medical advice with "Please consult your doctor for personalized guidance."
{lang_instruction}"""

    model = get_text_model()

    # Build conversation for Gemini
    conversation_parts = [system_prompt]

    for msg in request.history[-10:]:  # Keep last 10 messages for context
        prefix = "User: " if msg.role == "user" else "Assistant: "
        conversation_parts.append(prefix + msg.content)

    conversation_parts.append("User: " + request.message)
    conversation_parts.append("Assistant: ")

    full_prompt = "\n\n".join(conversation_parts)

    try:
        response = model.generate_content(full_prompt)
        reply = response.text.strip()
        return {"success": True, "reply": reply}
    except Exception as e:
        return {"success": False, "reply": "I'm sorry, I'm having trouble right now. Please try again in a moment.", "error": str(e)}


@router.post("/chat-image")
async def chat_with_image(
    file: UploadFile = File(...),
    message: str = Form("What is this?"),
    history: str = Form("[]"),
    accept_language: str = Header("en"),
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    """AI Chatbot with image analysis + user context."""
    import json as json_mod

    if not authorization:
        raise HTTPException(status_code=401, detail="Authentication required")

    token = authorization.replace("Bearer ", "")
    user_id = get_current_user_id(token)

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user_context = build_user_context(user, db)
    lang_instruction = get_language_instruction(accept_language)

    system_prompt = f"""You are a warm, caring AI health assistant for "Scan4Elders", an app for elderly users.
The user has shared an image. Analyze the image and respond helpfully.
If it's a medicine/tablet/prescription image, identify it and provide helpful details.
If it's something else, describe what you see and help the user.

PATIENT CONTEXT:
{user_context}

RULES:
- Be warm, friendly, and use simple language
- If it's a medicine, provide name, usage, dosage info
- If it's a prescription, read and explain the medicines
- Always recommend consulting their doctor for serious concerns
{lang_instruction}"""

    # Parse history
    try:
        hist = json_mod.loads(history)
    except Exception:
        hist = []

    image_bytes = await file.read()
    mime_type = file.content_type or "image/jpeg"

    from services.gemini_service import get_vision_model
    model = get_vision_model()

    conversation_text = system_prompt + "\n\n"
    for msg in hist[-6:]:
        prefix = "User: " if msg.get("role") == "user" else "Assistant: "
        conversation_text += prefix + msg.get("content", "") + "\n\n"
    conversation_text += f"User: {message}\n\nAssistant: "

    image_part = {"mime_type": mime_type, "data": image_bytes}

    try:
        response = model.generate_content([conversation_text, image_part])
        reply = response.text.strip()
        return {"success": True, "reply": reply}
    except Exception as e:
        return {"success": False, "reply": "I couldn't analyze that image. Please try again.", "error": str(e)}

