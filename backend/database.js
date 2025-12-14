const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.join(__dirname, "rooms.db");
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS rooms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      occupied INTEGER NOT NULL DEFAULT 0,
      last_updated TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  // Om tabellen skapades innan last_updated fanns:
  db.run(`ALTER TABLE rooms ADD COLUMN last_updated TEXT`, () => {});
});

function addRoom(name, callback) {
  const sql = `
    INSERT INTO rooms (name, occupied, last_updated)
    VALUES (?, 0, datetime('now'))
  `;
  db.run(sql, [name], function (err) {
    if (err) return callback(err);
    callback(null, {
      id: this.lastID,
      name,
      occupied: 0,
      last_updated: new Date().toISOString().slice(0, 19).replace("T", " "),
    });
  });
}

function updateRoom(roomId, occupied, callback) {
  const sql = `
    UPDATE rooms
    SET occupied = ?, last_updated = datetime('now')
    WHERE id = ?
  `;
  db.run(sql, [occupied, Number(roomId)], function (err) {
    if (err) return callback(err);
    callback(null, { changes: this.changes });
  });
}

function deleteRoom(roomId, callback) {
  const sql = `DELETE FROM rooms WHERE id = ?`;
  db.run(sql, [Number(roomId)], function (err) {
    if (err) return callback(err);
    callback(null, { changes: this.changes });
  });
}

module.exports = { db, addRoom, updateRoom, deleteRoom };
