# 🩺 Scan4Elders – AI Medication Assistant for Seniors

<p align="center">
  <img src="frontend/public/favicon.jpeg" alt="Scan4Elders Logo" width="120" style="border-radius: 16px;" />
</p>

<p align="center">
  <strong>An AI-powered, senior-friendly web application for prescription scanning, medicine identification, tablet verification, and medication reminders.</strong>
</p>

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 📷 **Prescription Upload & OCR** | Extract medicines, doctor info, and instructions from prescription images using Google Gemini AI. |
| 💊 **Medicine Lookup** | Identify any medicine by name search, barcode scan, or photo upload — with AI-powered results. |
| ✅ **Tablet Verification** | Check if a pill matches the prescription or is a safe alternative. |
| ⏰ **Medication Reminders** | Set and manage reminders with customizable frequency and time. |
| 👴 **Senior-Friendly Interface** | Built-in voice reading (TTS), large fonts, high-contrast themes, and simplified navigation. |
| 🌐 **Multilingual Support** | Supports English and multiple Indian languages for accessibility. |
| 🧑‍⚕️ **Caretaker Management** | Add and manage caretaker information with email notifications and emergency calling. |
| 🚨 **Emergency Contact** | One-tap emergency call to the registered caretaker directly from the navigation bar. |
| 🏥 **Medical Domain Selection** | Choose your preferred medical domain (Allopathy, Ayurvedic, Homeopathy, etc.) for tailored results. |

## 🖥️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React (Vite), Lucide-React Icons, Axios, i18next |
| **Backend** | FastAPI (Python), SQLAlchemy ORM, psycopg2 |
| **Database** | PostgreSQL (Neon Cloud) |
| **AI** | Google Gemini API (Vision + Text models) |
| **Auth** | JWT (python-jose), bcrypt password hashing |
| **Email** | SMTP email service for caretaker notifications |

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- A [Neon.tech](https://neon.tech/) PostgreSQL Database URL
- A Google Gemini API Key

### 1. Clone the Repository
```bash
git clone <repository-url>
cd "SVERI HACKATHON"
```

### 2. Database Setup
1. Create a free PostgreSQL database on [Neon.tech](https://neon.tech/).
2. Get your connection URL (append `?sslmode=require`).

### 3. Backend Setup
```bash
cd backend

# Create and activate virtual environment
python -m venv venv
# Windows
venv\Scripts\activate
# Mac/Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env from example and fill in your credentials
cp .env.example .env

# Start the server
uvicorn main:app --reload
```

> **Note:** The backend automatically creates all necessary database tables on startup via SQLAlchemy.

#### Backend Environment Variables (`.env`)
| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `GEMINI_API_KEY` | Google Gemini API key |
| `SECRET_KEY` | JWT signing secret |
| `SMTP_SERVER` | Email server address |
| `SMTP_PORT` | Email server port |
| `SMTP_USERNAME` | Email account username |
| `SMTP_PASSWORD` | Email account password |

### 4. Frontend Setup
```bash
cd frontend

# Create .env and set the API URL
cp .env.example .env
# Ensure VITE_API_URL=http://localhost:8000

# Install dependencies
npm install

# Start the development server
npm run dev
```

The application will be available at `http://localhost:5173`.

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/register` | Create a new account |
| `POST` | `/auth/login` | Authenticate and get JWT token |
| `PUT` | `/auth/update-profile` | Update user profile (incl. caretaker info) |
| `GET` | `/auth/profile` | Get current user profile |

### Prescriptions
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/prescriptions/upload` | Upload and extract data from a prescription image |
| `GET` | `/prescriptions` | List all user prescriptions |

### Medicine
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/medicine/search` | Search medicine by name using AI |
| `POST` | `/medicine/scan-barcode` | Look up medicine by barcode number |
| `POST` | `/medicine/scan-barcode-image` | Decode barcode from image and look up |
| `POST` | `/medicine/verify-tablet` | Verify a tablet image against prescriptions |
| `POST` | `/medicine/explain-term` | Explain medical terms in simple language |

### Reminders
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/reminders/set-reminder` | Schedule a medication reminder |
| `GET` | `/reminders` | Get all user reminders |

## 📁 Project Structure
```
SVERI HACKATHON/
├── backend/
│   ├── main.py                  # FastAPI entry point
│   ├── routes/
│   │   ├── auth.py              # Authentication routes
│   │   ├── prescription.py      # Prescription routes
│   │   ├── medicine.py          # Medicine identification routes
│   │   └── reminder.py          # Reminder routes
│   ├── models/
│   │   └── user.py              # SQLAlchemy User model
│   ├── services/
│   │   └── email_service.py     # Email notification service
│   └── requirements.txt
├── frontend/
│   ├── public/
│   │   └── favicon.jpeg         # App logo & favicon
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx       # Navigation bar with logo
│   │   │   ├── CaretakerSetup.jsx
│   │   │   └── PatientForm.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── ScanMedicine.jsx  # 3-column medicine identification
│   │   │   ├── ScanMedicine.css  # Premium HeroUI styling
│   │   │   ├── UploadPrescription.jsx
│   │   │   ├── SelectConcern.jsx
│   │   │   └── ...
│   │   ├── services/
│   │   │   └── api.js           # Axios API layer
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   └── package.json
└── README.md
```

## 🔧 Troubleshooting

| Issue | Solution |
|-------|----------|
| **pyzbar missing dependencies (Windows)** | Install the Visual C++ Redistributable |
| **Voice TTS not working** | Ensure your browser supports the SpeechSynthesis API and isn't blocking autoplay audio |
| **401 Unauthorized on profile update** | Ensure the JWT token is being sent in the `Authorization: Bearer <token>` header |
| **Favicon not showing** | Hard refresh with `Ctrl + Shift + R` to clear browser cache |

## 📄 License

This project was developed as part of the SVERI Hackathon.

---

<p align="center">
  Made with ❤️ for seniors who deserve better healthcare technology.
</p>
