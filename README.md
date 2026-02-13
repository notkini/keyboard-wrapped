# Keyboard Wrapped 

Keyboard Wrapped is a full stack system that tracks keyboard usage locally and generates Spotify Wrapped style insights about typing behavior.

The project focuses on **system level data collection**, **analytics**, and **privacy first design**, rather than text or content logging.





---

##  Features

- Tracks keyboard key press events locally
- Stores only key names and timestamps
- No text, words, or content is recorded
- Normalized key names for clean analytics
- Durable local storage using SQLite
- Designed for Wrapped style yearly summaries

Planned features:
- Keyboard usage analytics
- Hourly typing patterns
- Most used keys
- Typing personality summaries
- Web dashboard using React
- Backend API using Node.js and Express

---

## 🏗️ Architecture Overview

Keyboard
↓
Python Key Logger
↓
SQLite Database (local only)
↓
Analytics Exporter (JSON)
↓
Node.js API
↓
React Frontend (Wrapped UI)


---

## 🧠 How It Works

1. A Python background process listens to keyboard **key down events**
2. Each event is normalized and stored with a timestamp
3. Data is written safely to a local SQLite database
4. No key sequences or text reconstruction is performed
5. Analytics are computed later from aggregated event data

---

## 🔐 Privacy & Ethics

This project is **privacy safe by design**.

What it DOES:
- Logs individual key press events
- Stores key names (e.g. `a`, `space`, `ctrl`)
- Stores timestamps only

What it DOES NOT:
- Store words or sentences
- Capture typed content
- Track applications or websites
- Transmit data over the network

All data remains **local to the user’s machine**.

Database files are explicitly excluded from version control.

---

## 🗄️ Data Storage

- Database: SQLite
- Mode: Write Ahead Logging (WAL)
- Files generated locally:
  - `keyboard.db`
  - `keyboard.db-wal`
  - `keyboard.db-shm`

These files are **gitignored** and never pushed to GitHub.

---

## 📁 Project Structure

keyboard-wrapped/
│
├── tracker-python/
│ ├── key_logger.py
│ ├── db.py
│ ├── requirements.txt
│ └── keyboard.db (ignored)
│
├── .gitignore
└── README.md

