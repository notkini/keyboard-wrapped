const express = require("express");
const cors = require("cors");

const statsRoutes = require("./routes/stats");
const authRoutes = require("./routes/auth");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Auth routes
app.use("/auth", authRoutes);

// Protected stats routes
app.use("/api", statsRoutes);

app.get("/", (req, res) => {
  res.send("Keyboard Wrapped API is running");
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
