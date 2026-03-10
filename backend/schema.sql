-- Scan4Elders Database Schema
-- PostgreSQL (Neon Cloud)

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    age INTEGER,
    phone VARCHAR(20),
    accessibility_large_font BOOLEAN DEFAULT FALSE,
    accessibility_high_contrast BOOLEAN DEFAULT FALSE,
    accessibility_voice BOOLEAN DEFAULT FALSE,
    medical_profile JSONB,
    caretaker_name VARCHAR(100),
    caretaker_email VARCHAR(255),
    caretaker_phone VARCHAR(20),
    caretaker_relation VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS medicines (
    id SERIAL PRIMARY KEY,
    name VARCHAR(300) NOT NULL,
    barcode VARCHAR(100) UNIQUE,
    manufacturer VARCHAR(300),
    composition TEXT,
    usage TEXT,
    dosage TEXT,
    side_effects TEXT,
    precautions TEXT,
    suitable_age_range TEXT,
    missed_dose_guidelines TEXT,
    usage_instructions TEXT,
    medical_terms_explanation JSONB,
    image_url TEXT,
    category VARCHAR(200),
    price VARCHAR(50),
    source VARCHAR(50) DEFAULT 'gemini',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS prescriptions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    image_url TEXT,
    raw_text TEXT,
    extracted_data JSONB,
    doctor_name VARCHAR(200),
    hospital_name VARCHAR(300),
    prescription_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS prescription_medicines (
    id SERIAL PRIMARY KEY,
    prescription_id INTEGER NOT NULL REFERENCES prescriptions(id) ON DELETE CASCADE,
    medicine_id INTEGER REFERENCES medicines(id) ON DELETE SET NULL,
    medicine_name VARCHAR(300) NOT NULL,
    dosage VARCHAR(200),
    frequency VARCHAR(200),
    duration VARCHAR(200),
    instructions TEXT
);

CREATE TABLE IF NOT EXISTS medicine_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    medicine_id INTEGER,
    medicine_name VARCHAR(300) NOT NULL,
    action VARCHAR(50) NOT NULL,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reminders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    medicine_name VARCHAR(300) NOT NULL,
    dosage VARCHAR(200),
    frequency VARCHAR(100),
    reminder_time TIME NOT NULL,
    days_of_week VARCHAR(100),
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    google_calendar_event_id VARCHAR(255),
    notes VARCHAR(500),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_medicines_name ON medicines(name);
CREATE INDEX IF NOT EXISTS idx_medicines_barcode ON medicines(barcode);
CREATE INDEX IF NOT EXISTS idx_prescriptions_user_id ON prescriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_medicine_history_user_id ON medicine_history(user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_user_id ON reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
