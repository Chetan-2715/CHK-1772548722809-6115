"""
Scan4Elders – AI Medication Assistant for Seniors
FastAPI Backend Application — B2B Edition
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from database import init_db
from routes.auth import router as auth_router
from routes.prescription import router as prescription_router
from routes.medicine import router as medicine_router
from routes.reminder import router as reminder_router
from routes.chatbot import router as chatbot_router
from routes.voice import router as voice_router
from routes.doctor_auth import router as doctor_router
from routes.appointments import router as appointments_router
from routes.organization import router as org_router

app = FastAPI(
    title="Scan4Elders B2B API",
    description="AI-Powered Health Platform — Patient · Doctor · Organization",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all routers
app.include_router(auth_router)
app.include_router(prescription_router)
app.include_router(medicine_router)
app.include_router(reminder_router)
app.include_router(chatbot_router)
app.include_router(voice_router)
app.include_router(doctor_router)
app.include_router(appointments_router)
app.include_router(org_router)


@app.on_event("startup")
async def startup():
    """Initialize database and load medicine dataset on startup."""
    # Init DB tables
    try:
        # Import all models so SQLAlchemy creates tables in correct order
        from models.organization import Organization, SubscriptionPlan
        from models.doctor import Doctor
        from models.appointment import Appointment
        init_db()
        print("✅ Database tables created successfully")
    except Exception as e:
        print(f"⚠️ Database initialization warning: {e}")

    # Load Kaggle medicine dataset for fuzzy matching
    try:
        from services.medicine_db_service import load_kaggle_dataset
        count = load_kaggle_dataset()
        if count > 0:
            print(f"✅ Medicine dataset loaded: {count} medicines available for fuzzy matching")
        else:
            print("ℹ️  No medicine dataset found — place medicines.csv in d:/SVERI HACKATHON/data/ for enhanced matching")
    except Exception as e:
        print(f"⚠️ Medicine dataset load warning: {e}")


@app.get("/")
async def root():
    return {
        "message": "Welcome to Scan4Elders B2B API",
        "version": "2.0.0",
        "docs": "/docs",
        "endpoints": {
            "auth": "/auth",
            "doctor": "/doctor",
            "appointments": "/appointments",
            "organization": "/org",
            "prescriptions": "/prescriptions",
            "medicine": "/medicine",
            "reminders": "/reminders"
        }
    }


@app.get("/health")
async def health_check():
    from services.medicine_db_service import get_dataset_stats
    try:
        stats = get_dataset_stats()
    except Exception:
        stats = {}
    return {"status": "healthy", "service": "scan4elders-b2b-api", "medicine_db": stats}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

