import time
from pynput import keyboard #type: ignore 
from db import init_db, get_connection

def normalize_key(key):
    try:
        # Character keys
        char = key.char

        # Ignore control characters like Ctrl+C, Ctrl+Z
        if char is not None and ord(char) < 32:
            return None

        return char.lower()

    except AttributeError:
        # Special keys
        key_name = str(key).replace("Key.", "").lower()

        modifier_map = {
            "ctrl_l": "ctrl",
            "ctrl_r": "ctrl",
            "alt_l": "alt",
            "alt_r": "alt",
            "shift_l": "shift",
            "shift_r": "shift"
        }

        return modifier_map.get(key_name, key_name)


def on_press(key):
    key_name = normalize_key(key)

    if key_name is None:
        return

    timestamp = int(time.time())

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        "INSERT INTO key_events (key, timestamp) VALUES (?, ?)",
        (key_name, timestamp)
    )

    conn.commit()
    conn.close()


def main():
    init_db()
    print("Keyboard tracking started")
    print("Press CTRL + C to stop")

    with keyboard.Listener(on_press=on_press) as listener:
        listener.join()

if __name__ == "__main__":
    main()
