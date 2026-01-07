const express = require("express");
const cors = require("cors");
const statsRoutes = require("./routes/stats");

const app = express();   // <-- app is defined HERE
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.use("/api", statsRoutes);

app.get("/", (req, res) => {
  res.send("Keyboard Wrapped API is running");
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
