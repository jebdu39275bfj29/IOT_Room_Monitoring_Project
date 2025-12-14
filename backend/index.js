const express = require("express");
const cors = require("cors");
const { db, addRoom, deleteRoom, updateRoom } = require("./database");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/rooms", (req, res) => {
  db.all("SELECT * FROM rooms ORDER BY id ASC", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post("/updateRoom", (req, res) => {
  const { room_id, occupied } = req.body;

  if (room_id === undefined || occupied === undefined) {
    return res.status(400).json({ error: "room_id and occupied are required" });
  }

  updateRoom(room_id, occupied, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.changes === 0) return res.status(404).json({ error: "Room not found" });
    res.json({ message: "Room updated" });
  });
});

app.post("/addRoom", (req, res) => {
  const trimmed = String(req.body?.name || "").trim();
  if (!trimmed) return res.status(400).json({ error: "Room name is required" });

  addRoom(trimmed, (err, room) => {
    if (err) {
      if (String(err.message).includes("UNIQUE")) {
        return res.status(409).json({ error: "Room name already exists" });
      }
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json(room);
  });
});

app.post("/deleteRoom", (req, res) => {
  const { room_id } = req.body;

  console.log("DELETE request received:", req.body); // <-- VIKTIG LOGG

  if (room_id === undefined) {
    return res.status(400).json({ error: "room_id is required" });
  }

  deleteRoom(room_id, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.changes === 0) return res.status(404).json({ error: "Room not found" });
    res.json({ message: "Room deleted" });
  });
});

app.listen(3001, () => {
  console.log("Backend running on http://localhost:3001");
});
