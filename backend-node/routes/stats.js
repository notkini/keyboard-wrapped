const express = require("express");
const fs = require("fs");
const path = require("path");
const auth = require("../middleware/auth");

const router = express.Router();

// Path to shared/stats.json
const STATS_PATH = path.join(
  __dirname,
  "..",
  "..",
  "shared",
  "stats.json"
);

function loadStats() {
  if (!fs.existsSync(STATS_PATH)) {
    throw new Error("stats.json not found. Run analytics.py first.");
  }

  const raw = fs.readFileSync(STATS_PATH, "utf-8");
  return JSON.parse(raw);
}

router.get("/summary", auth, (req, res) => {
  try {
    const stats = loadStats();
    res.json(stats.summary);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/top-keys", auth, (req, res) => {
  try {
    const stats = loadStats();
    res.json(stats.top_keys);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/categories", auth, (req, res) => {
  try {
    const stats = loadStats();
    res.json(stats.categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/hourly", auth, (req, res) => {
  try {
    const stats = loadStats();
    res.json(stats.hourly);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/personality", auth, (req, res) => {
  try {
    const stats = loadStats();
    res.json({ personality: stats.personality });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
