import smtplib
from email.message import EmailMessage
import os

SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USERNAME = os.getenv("SMTP_USERNAME", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")

def send_caretaker_email(caretaker_email: str, caretaker_name: str, patient_name: str, patient_email: str):
    """
    Sends an email to the newly assigned caretaker notifying them that they have been selected.
    If no SMTP credentials are provided, it will gracefully fallback and print the email to the console.
    """
    subject = f"You have been added as a Caretaker for {patient_name}"
    body = f"""Dear {caretaker_name},

{patient_name} ({patient_email}) has added you as their caretaker on the Scan4Elders platform. 
As a caretaker, you will be able to access {patient_name}'s prescription scans, weekly reports, and medication reminders.

Thank you for your support,
Scan4Elders Team
"""

    msg = EmailMessage()
    msg.set_content(body)
    msg["Subject"] = subject
    msg["From"] = SMTP_USERNAME or "no-reply@scan4elders.com"
    msg["To"] = caretaker_email

    if not SMTP_USERNAME or not SMTP_PASSWORD:
        print(f"[Email Notification Simulation]")
        print(f"To: {caretaker_email}\nSubject: {subject}\nBody:\n{body}")
        return True

    try:
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SMTP_USERNAME, SMTP_PASSWORD)
        server.send_message(msg)
        server.quit()
        return True
    except Exception as e:
        print(f"Failed to send email to {caretaker_email}: {e}")
        return False
