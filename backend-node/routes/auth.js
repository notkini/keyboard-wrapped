const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../db");

const router = express.Router();

const JWT_SECRET = "keyboard_wrapped_secret";

router.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const hash = bcrypt.hashSync(password, 10);
  const createdAt = Math.floor(Date.now() / 1000);

  db.run(
    "INSERT INTO users (username, password_hash, created_at) VALUES (?, ?, ?)",
    [username, hash, createdAt],
    function (err) {
      if (err) {
        return res.status(400).json({ error: "User already exists" });
      }

      res.json({ success: true });
    }
  );
});

router.post("/login", (req, res) => {
  const { username, password } = req.body;

  db.get(
    "SELECT * FROM users WHERE username = ?",
    [username],
    (err, user) => {
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const valid = bcrypt.compareSync(password, user.password_hash);
      if (!valid) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const token = jwt.sign(
        { id: user.id, username: user.username },
        JWT_SECRET,
        { expiresIn: "2h" }
      );

      res.json({ token });
    }
  );
});

module.exports = router;
