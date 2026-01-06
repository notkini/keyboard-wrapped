import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).parent / "keyboard.db"

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.execute("PRAGMA journal_mode=WAL;")
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS key_events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            key TEXT NOT NULL,
            timestamp INTEGER NOT NULL
        )
    """)

    cursor.execute("""
        CREATE INDEX IF NOT EXISTS idx_timestamp
        ON key_events(timestamp)
    """)

    conn.commit()
    conn.close()
