"""
Scan4Elders – AI Medication Assistant for Seniors
FastAPI Backend Application
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

app = FastAPI(
    title="Scan4Elders API",
    description="AI Medication Assistant for Seniors - Backend API",
    version="1.0.0",
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

# Include routers
app.include_router(auth_router)
app.include_router(prescription_router)
app.include_router(medicine_router)
app.include_router(reminder_router)


@app.on_event("startup")
async def startup():
    """Initialize database on startup."""
    try:
        init_db()
        print("✅ Database tables created successfully")
    except Exception as e:
        print(f"⚠️ Database initialization warning: {e}")


@app.get("/")
async def root():
    return {
        "message": "Welcome to Scan4Elders API",
        "version": "1.0.0",
        "docs": "/docs",
        "endpoints": {
            "auth": "/auth",
            "prescriptions": "/prescriptions",
            "medicine": "/medicine",
            "reminders": "/reminders"
        }
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "scan4elders-api"}


# Upload prescription endpoint (alias for convenience)
@app.post("/upload-prescription")
async def upload_prescription_alias(
    *args, **kwargs
):
    """Alias endpoint. Use /prescriptions/upload instead."""
    from routes.prescription import upload_prescription
    return await upload_prescription(*args, **kwargs)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
