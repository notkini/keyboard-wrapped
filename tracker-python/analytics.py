import sqlite3
import json
from pathlib import Path
import time


DB_PATH = Path(__file__).parent / "keyboard.db"
OUTPUT_DIR = Path(__file__).parent.parent / "shared"
OUTPUT_DIR.mkdir(exist_ok=True)
OUTPUT_FILE = OUTPUT_DIR / "stats.json"


def get_connection():
    return sqlite3.connect(DB_PATH)


def fetch_one(query):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(query)
    result = cur.fetchone()
    conn.close()
    return result


def fetch_all(query):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(query)
    result = cur.fetchall()
    conn.close()
    return result


def get_total_keys():
    return fetch_one("SELECT COUNT(*) FROM key_events;")[0]


def get_top_keys():
    rows = fetch_all("""
        SELECT key, COUNT(*) AS count
        FROM key_events
        GROUP BY key
        ORDER BY count DESC
        LIMIT 10;
    """)
    return [{"key": k, "count": c} for k, c in rows]


def get_hourly_distribution():
    rows = fetch_all("""
        SELECT
          strftime('%H', timestamp, 'unixepoch') AS hour,
          COUNT(*) AS count
        FROM key_events
        GROUP BY hour
        ORDER BY hour;
    """)
    return {hour: count for hour, count in rows}


def get_category_distribution():
    rows = fetch_all("""
        SELECT
          CASE
            WHEN length(key) = 1 AND key BETWEEN 'a' AND 'z' THEN 'letters'
            WHEN length(key) = 1 AND key BETWEEN '0' AND '9' THEN 'numbers'
            ELSE 'special'
          END AS category,
          COUNT(*) AS count
        FROM key_events
        GROUP BY category;
    """)
    return {cat: count for cat, count in rows}


def get_most_active_hour():
    row = fetch_one("""
        SELECT
          strftime('%H', timestamp, 'unixepoch') AS hour,
          COUNT(*) AS count
        FROM key_events
        GROUP BY hour
        ORDER BY count DESC
        LIMIT 1;
    """)
    return row[0]


def personality_from_top_keys(top_keys):
    keys = [item["key"] for item in top_keys]

    if "backspace" in keys:
        return "Backspace Warrior"
    if "ctrl" in keys:
        return "Shortcut Power User"
    if "space" in keys:
        return "Storyteller"

    return "Balanced Typist"

def get_since_timestamp(mode):
    now = int(time.time())

    if mode == "today":
        return now - 86400
    if mode == "week":
        return now - (7 * 86400)
    return 0  # all time

def get_top_combos():
    rows = fetch_all("""
        SELECT
          e1.key || '+' || e2.key AS combo,
          COUNT(*) AS count
        FROM key_events e1
        JOIN key_events e2
          ON e1.timestamp = e2.timestamp
        WHERE e1.key IN ('ctrl', 'alt', 'shift')
          AND e2.key NOT IN ('ctrl', 'alt', 'shift')
        GROUP BY combo
        ORDER BY count DESC
        LIMIT 5;
    """)
    return [{"combo": c, "count": n} for c, n in rows]



def main():
    total_keys = get_total_keys()
    top_keys = get_top_keys()
    hourly = get_hourly_distribution()
    categories = get_category_distribution()
    most_active_hour = get_most_active_hour()
    personality = personality_from_top_keys(top_keys)

    stats = {
        "summary": {
            "total_keys": total_keys,
            "most_active_hour": int(most_active_hour)
        },
        "top_keys": top_keys,
        "categories": categories,
        "hourly": hourly,
        "personality": personality
    }

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(stats, f, indent=2)

    print("SQL powered analytics exported to:", OUTPUT_FILE)


if __name__ == "__main__":
    main()
