"""
Reminder routes for managing medication reminders.
"""
from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import time, datetime
from database import get_db
from models.reminder import Reminder
from routes.auth import get_current_user_id

router = APIRouter(prefix="/reminders", tags=["Reminders"])


class ReminderCreate(BaseModel):
    medicine_name: str
    dosage: str | None = None
    frequency: str | None = "daily"
    reminder_time: str  # HH:MM format
    days_of_week: str | None = "mon,tue,wed,thu,fri,sat,sun"
    start_date: str | None = None
    end_date: str | None = None
    notes: str | None = None


class ReminderUpdate(BaseModel):
    medicine_name: str | None = None
    dosage: str | None = None
    frequency: str | None = None
    reminder_time: str | None = None
    days_of_week: str | None = None
    start_date: str | None = None
    end_date: str | None = None
    is_active: bool | None = None
    notes: str | None = None


@router.post("/set-reminder")
async def create_reminder(
    reminder_data: ReminderCreate,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    """Create a new medication reminder."""
    if not authorization:
        raise HTTPException(status_code=401, detail="Authentication required")

    token = authorization.replace("Bearer ", "")
    user_id = get_current_user_id(token)

    # Parse time
    try:
        hours, minutes = map(int, reminder_data.reminder_time.split(":"))
        reminder_time = time(hours, minutes)
    except (ValueError, AttributeError):
        raise HTTPException(status_code=400, detail="Invalid time format. Use HH:MM")

    # Parse dates
    start_date = None
    end_date = None
    if reminder_data.start_date:
        try:
            start_date = datetime.fromisoformat(reminder_data.start_date)
        except ValueError:
            pass
    if reminder_data.end_date:
        try:
            end_date = datetime.fromisoformat(reminder_data.end_date)
        except ValueError:
            pass

    reminder = Reminder(
        user_id=user_id,
        medicine_name=reminder_data.medicine_name,
        dosage=reminder_data.dosage,
        frequency=reminder_data.frequency,
        reminder_time=reminder_time,
        days_of_week=reminder_data.days_of_week,
        start_date=start_date,
        end_date=end_date,
        notes=reminder_data.notes,
        is_active=True,
    )

    db.add(reminder)
    db.commit()
    db.refresh(reminder)

    # Generate Google Calendar event data (for frontend to use)
    calendar_event = generate_calendar_event(reminder)

    return {
        "success": True,
        "reminder_id": reminder.id,
        "message": f"Reminder set for {reminder_data.medicine_name} at {reminder_data.reminder_time}",
        "calendar_event": calendar_event
    }


@router.get("/")
async def get_reminders(
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    """Get all reminders for the current user."""
    if not authorization:
        raise HTTPException(status_code=401, detail="Authentication required")

    token = authorization.replace("Bearer ", "")
    user_id = get_current_user_id(token)

    reminders = db.query(Reminder).filter(
        Reminder.user_id == user_id
    ).order_by(Reminder.reminder_time).all()

    return {
        "reminders": [
            {
                "id": r.id,
                "medicine_name": r.medicine_name,
                "dosage": r.dosage,
                "frequency": r.frequency,
                "reminder_time": r.reminder_time.strftime("%H:%M") if r.reminder_time else None,
                "days_of_week": r.days_of_week,
                "start_date": r.start_date.isoformat() if r.start_date else None,
                "end_date": r.end_date.isoformat() if r.end_date else None,
                "is_active": r.is_active,
                "notes": r.notes,
                "created_at": r.created_at.isoformat() if r.created_at else None,
            }
            for r in reminders
        ]
    }


@router.put("/{reminder_id}")
async def update_reminder(
    reminder_id: int,
    reminder_data: ReminderUpdate,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    """Update an existing reminder."""
    if not authorization:
        raise HTTPException(status_code=401, detail="Authentication required")

    token = authorization.replace("Bearer ", "")
    user_id = get_current_user_id(token)

    reminder = db.query(Reminder).filter(
        Reminder.id == reminder_id,
        Reminder.user_id == user_id
    ).first()

    if not reminder:
        raise HTTPException(status_code=404, detail="Reminder not found")

    if reminder_data.medicine_name is not None:
        reminder.medicine_name = reminder_data.medicine_name
    if reminder_data.dosage is not None:
        reminder.dosage = reminder_data.dosage
    if reminder_data.frequency is not None:
        reminder.frequency = reminder_data.frequency
    if reminder_data.reminder_time is not None:
        try:
            hours, minutes = map(int, reminder_data.reminder_time.split(":"))
            reminder.reminder_time = time(hours, minutes)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid time format")
    if reminder_data.days_of_week is not None:
        reminder.days_of_week = reminder_data.days_of_week
    if reminder_data.is_active is not None:
        reminder.is_active = reminder_data.is_active
    if reminder_data.notes is not None:
        reminder.notes = reminder_data.notes

    db.commit()
    return {"success": True, "message": "Reminder updated"}


@router.delete("/{reminder_id}")
async def delete_reminder(
    reminder_id: int,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    """Delete a reminder."""
    if not authorization:
        raise HTTPException(status_code=401, detail="Authentication required")

    token = authorization.replace("Bearer ", "")
    user_id = get_current_user_id(token)

    reminder = db.query(Reminder).filter(
        Reminder.id == reminder_id,
        Reminder.user_id == user_id
    ).first()

    if not reminder:
        raise HTTPException(status_code=404, detail="Reminder not found")

    db.delete(reminder)
    db.commit()
    return {"success": True, "message": "Reminder deleted"}


def generate_calendar_event(reminder: Reminder) -> dict:
    """Generate a Google Calendar event structure for the reminder."""
    start_date = reminder.start_date or datetime.now()

    # Combine date with time
    start_datetime = datetime.combine(start_date.date(), reminder.reminder_time)

    # Calculate recurrence rule
    recurrence = []
    if reminder.frequency == "daily":
        recurrence = ["RRULE:FREQ=DAILY"]
    elif reminder.frequency == "twice_daily":
        recurrence = ["RRULE:FREQ=DAILY"]
    elif reminder.frequency == "weekly":
        recurrence = ["RRULE:FREQ=WEEKLY"]

    if reminder.end_date:
        until = reminder.end_date.strftime("%Y%m%dT%H%M%SZ")
        recurrence = [r + f";UNTIL={until}" for r in recurrence]

    return {
        "summary": f"💊 Take {reminder.medicine_name}",
        "description": f"Medication Reminder\nMedicine: {reminder.medicine_name}\nDosage: {reminder.dosage or 'As prescribed'}\n{reminder.notes or ''}",
        "start": {
            "dateTime": start_datetime.isoformat(),
            "timeZone": "Asia/Kolkata"
        },
        "end": {
            "dateTime": (start_datetime + __import__("datetime").timedelta(minutes=30)).isoformat(),
            "timeZone": "Asia/Kolkata"
        },
        "recurrence": recurrence,
        "reminders": {
            "useDefault": False,
            "overrides": [
                {"method": "popup", "minutes": 5},
                {"method": "popup", "minutes": 0}
            ]
        }
    }
