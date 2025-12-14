const express = require("express");
const cors = require("cors");
const { db, addRoom, deleteRoom, updateRoom } = require("./database");

const app = express();
app.use(cors());
app.use(express.json());

// Get all rooms
app.get("/rooms", (req, res) => {
  db.all("SELECT * FROM rooms ORDER BY id ASC", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Update room status + last_updated
app.post("/updateRoom", (req, res) => {
  const { room_id, occupied } = req.body;

  if (room_id === undefined || occupied === undefined) {
    return res.status(400).json({ error: "room_id and occupied are required" });
  }

  updateRoom(room_id, occupied, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Room updated" });
  });
});

// Add room (name must be unique)
app.post("/addRoom", (req, res) => {
  const { name } = req.body;
  const trimmed = (name || "").trim();

  if (!trimmed) {
    return res.status(400).json({ error: "Room name is required" });
  }

  addRoom(trimmed, (err, room) => {
    if (err) {
      // UNIQUE constraint error
      if (String(err.message).includes("UNIQUE")) {
        return res.status(409).json({ error: "Room name already exists" });
      }
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json(room);
  });
});

// Delete room
app.post("/deleteRoom", (req, res) => {
  const { room_id } = req.body;

  if (!room_id) {
    return res.status(400).json({ error: "room_id is required" });
  }

  deleteRoom(room_id, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Room deleted" });
  });
});

app.listen(3001, () => {
  console.log("Backend running on port http://localhost:3001");
});
