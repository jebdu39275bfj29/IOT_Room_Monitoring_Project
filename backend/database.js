const sqlite3 = require("sqlite3").verbose();

// Öppna/skapad databasen
const db = new sqlite3.Database("./rooms.db", (err) => {
  if (err) console.error(err.message);
  else console.log("Connected to SQLite database");
});

// Skapa tabell + demo-data
db.serialize(() => {
  // 1. Skapa tabellen om den inte finns
  db.run(
    `CREATE TABLE IF NOT EXISTS rooms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      occupied INTEGER NOT NULL DEFAULT 0
    )`,
    (err) => {
      if (err) console.error("Error creating table:", err.message);
    }
  );

  // 2. Lägg in demo-rum om tabellen är tom
  db.get("SELECT COUNT(*) AS count FROM rooms", (err, row) => {
    if (err) {
      console.error("Error counting rooms:", err.message);
      return;
    }

    if (row.count === 0) {
      db.run("INSERT INTO rooms (name) VALUES ('Room A')");
      db.run("INSERT INTO rooms (name) VALUES ('Room B')");
      db.run("INSERT INTO rooms (name) VALUES ('Room C')");
      console.log("Inserted demo rooms");
    }
  });
});

// ---- Hjälpfunktion för DELETE ----
function deleteRoom(id, callback) {
  const sql = "DELETE FROM rooms WHERE id = ?";
  db.run(sql, [id], function (err) {
    if (err) return callback(err);
    callback(null);
  });
}

// Exportera det vi behöver
module.exports = { db, deleteRoom };
