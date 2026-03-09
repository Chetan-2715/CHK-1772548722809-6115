# Medi-Scribe – AI Medication Assistant for Seniors

A full-stack project to help seniors scan prescriptions, identify medicines, verify tablets, and set reminders, powered by Gemini AI and a Neon PostgreSQL database.

## Features
- **Prescription Upload & OCR**: Extract medicines, doctor info, and instructions from images.
- **Medicine Lookup**: Identify by barcode, image, or text search.
- **Tablet Verification**: Check if a pill matches the prescription or is a safe alternative.
- **Medication Reminders**: Set reminders with frequency and time.
- **Senior-Friendly Interface**: Built-in voice reading, large fonts, and high contrast themes.

## Tech Stack
- **Frontend**: React (Vite), Lucide-React, Axios
- **Backend**: FastAPI (Python), SQLAlchemy, psycopg2
- **Database**: PostgreSQL (Neon Cloud)
- **AI Integration**: Google Gemini API (Vision + Text models)

## Installation Guide

### Prerequisites
- Python 3.10+
- Node.js 18+
- A Neon PostgreSQL Database URL
- A Google Gemini API Key

### 1. Database Setup
1. Create a free PostgreSQL database on [Neon.tech](https://neon.tech/).
2. Get your connection URL (make sure to append `?sslmode=require`).

### 2. Backend Setup
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # On Windows
   venv\Scripts\activate
   # On Mac/Linux
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Create a `.env` file from the example:
   ```bash
   cp .env.example .env
   ```
   *Edit `.env` and add your `DATABASE_URL`, `GEMINI_API_KEY`, etc.*
5. Run the FastAPI development server:
   ```bash
   uvicorn main:app --reload
   ```
   *Note: Upon startup, the backend automatically creates all necessary database tables via SQLAlchemy.*

### 3. Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Create a `.env` file:
   ```bash
   cp .env.example .env
   ```
   *Ensure `VITE_API_URL` points to your backend (default is `http://localhost:8000`).*
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the Vite development server:
   ```bash
   npm run dev
   ```

### 4. Available API Endpoints
- `POST /auth/register` - Create an account
- `POST /auth/login` - Authenticate account
- `POST /prescriptions/upload` - Extract data from an image
- `GET /prescriptions` - List user prescriptions
- `POST /medicine/scan-barcode` - Look up medicine by barcode text
- `POST /medicine/scan-barcode-image` - Look up by decoding a barcode from an image
- `POST /medicine/verify-tablet` - Verify tablet image or name against user prescriptions
- `POST /medicine/explain-term` - Explain complex medical terms simply
- `POST /reminders/set-reminder` - Schedule a medication reminder

### Troubleshooting
- **pyzbar missing dependencies (Windows)**: You may need the Visual C++ Redistributable to run pyzbar barcode decoding.
- **Voice TTS not working**: Ensure your browser supports SpeechSynthesis API and isn't blocking autoplay audio.
