const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.join(__dirname, "rooms.db");
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error("DB open error:", err);
  else console.log("Connected to SQLite database");
});

db.serialize(() => {
  // 1) rooms table with UNIQUE name + last_updated
  db.run(`
    CREATE TABLE IF NOT EXISTS rooms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      occupied INTEGER NOT NULL DEFAULT 0,
      last_updated TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  // 2) If you already had an old table (no last_updated), try to add column safely
  db.run(`ALTER TABLE rooms ADD COLUMN last_updated TEXT`, (err) => {
    // ignore "duplicate column name" error
  });

  // 3) Ensure old rows have a value
  db.run(
    `UPDATE rooms SET last_updated = COALESCE(last_updated, datetime('now'))`,
    (err) => {}
  );

  // 4) Insert demo data if empty
  db.get("SELECT COUNT(*) AS count FROM rooms", (err, row) => {
    if (err) return console.error(err);
    if (row.count === 0) {
      const stmt = db.prepare(
        "INSERT INTO rooms (name, occupied, last_updated) VALUES (?, ?, datetime('now'))"
      );
      stmt.run("Room A", 0);
      stmt.run("Room B", 0);
      stmt.run("Room C", 0);
      stmt.finalize();
      console.log("Inserted demo rooms");
    }
  });
});

// ---- DB helper functions ----
function addRoom(name, callback) {
  const sql =
    "INSERT INTO rooms (name, occupied, last_updated) VALUES (?, 0, datetime('now'))";
  db.run(sql, [name], function (err) {
    if (err) return callback(err);
    callback(null, { id: this.lastID, name, occupied: 0 });
  });
}

function deleteRoom(id, callback) {
  const sql = "DELETE FROM rooms WHERE id = ?";
  db.run(sql, [id], function (err) {
    if (err) return callback(err);
    callback(null);
  });
}

function updateRoom(id, occupied, callback) {
  const sql =
    "UPDATE rooms SET occupied = ?, last_updated = datetime('now') WHERE id = ?";
  db.run(sql, [occupied, id], function (err) {
    if (err) return callback(err);
    callback(null);
  });
}

module.exports = { db, addRoom, deleteRoom, updateRoom };
