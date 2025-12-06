const express = require("express");
const cors = require("cors");
const db = require("./database");

const app = express();
app.use(cors());
app.use(express.json());

// Endpoint: Get all rooms
app.get("/rooms", (req, res) => {
  db.all("SELECT * FROM rooms", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Endpoint: Update room status
app.post("/updateRoom", (req, res) => {
  const { room_id, occupied } = req.body;
  db.run(
    "UPDATE rooms SET occupied = ? WHERE id = ?",
    [occupied, room_id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Room updated" });
    }
  );
});

app.post("/addRoom", (req, res) => {
  const { name } = req.body;
  const trimmed = (name || "").trim();

  if (!trimmed) {
    return res.status(400).json({ error: "Room name is required" });
  }

  db.run(
    "INSERT INTO rooms (name, occupied) VALUES (?, 0)",
    [trimmed],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });

      res.status(201).json({
        id: this.lastID,
        name: trimmed,
        occupied: 0,
      });
    }
  );
});

app.listen(3001, () => {
  console.log("Backend running on port http://localhost:3001");
});
