import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()
db_url = os.getenv("DATABASE_URL")
conn = psycopg2.connect(db_url)
cursor = conn.cursor()

try:
    cursor.execute("ALTER TABLE users ADD COLUMN caretaker_name VARCHAR(100);")
    cursor.execute("ALTER TABLE users ADD COLUMN caretaker_email VARCHAR(255);")
    cursor.execute("ALTER TABLE users ADD COLUMN caretaker_phone VARCHAR(20);")
    cursor.execute("ALTER TABLE users ADD COLUMN caretaker_relation VARCHAR(50);")
    conn.commit()
    print("Successfully added caretaker columns!")
except Exception as e:
    print("Error:", e)
    conn.rollback()
finally:
    cursor.close()
    conn.close()
