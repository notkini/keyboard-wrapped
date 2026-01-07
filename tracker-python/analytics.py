import sqlite3
import json
from collections import Counter, defaultdict
from pathlib import Path
from datetime import datetime

DB_PATH = Path(__file__).parent / "keyboard.db"
OUTPUT_DIR = Path(__file__).parent.parent / "shared"
OUTPUT_DIR.mkdir(exist_ok=True)
OUTPUT_FILE = OUTPUT_DIR / "stats.json"


def categorize_key(key):
    if len(key) == 1 and key.isalpha():
        return "letters"
    if len(key) == 1 and key.isdigit():
        return "numbers"
    return "special"



def load_events():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT key, timestamp FROM key_events")
    rows = cursor.fetchall()
    conn.close()
    return rows


def compute_stats(events):
    total_keys = len(events)

    key_counts = Counter()
    hourly_counts = defaultdict(int)
    category_counts = defaultdict(int)

    for key, ts in events:
        key_counts[key] += 1

        hour = datetime.fromtimestamp(ts).hour
        hourly_counts[hour] += 1

        category = categorize_key(key)
        category_counts[category] += 1

    most_active_hour = max(hourly_counts, key=hourly_counts.get)

    return {
        "summary": {
            "total_keys": total_keys,
            "most_active_hour": most_active_hour
        },
        "top_keys": [
            {"key": k, "count": v}
            for k, v in key_counts.most_common(10)
        ],
        "categories": dict(category_counts),
        "hourly": dict(hourly_counts)
    }


def personality_tag(stats):
    top_keys = stats["top_keys"]

    for item in top_keys:
        if item["key"] == "backspace":
            return "Backspace Warrior"
        if item["key"] == "ctrl":
            return "Shortcut Power User"
        if item["key"] == "space":
            return "Storyteller"

    return "Balanced Typist"


def main():
    events = load_events()

    if not events:
        print("No data found. Run key_logger.py first.")
        return

    stats = compute_stats(events)
    stats["personality"] = personality_tag(stats)

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(stats, f, indent=2)

    print("Analytics exported to:", OUTPUT_FILE)


if __name__ == "__main__":
    main()
