const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./rooms.db", (err) => {
  if (err) console.error(err.message);
  else console.log("Connected to SQLite database");
});

// Kör allt i ordning
db.serialize(() => {
  // 1. Skapa tabellen om den inte finns
  db.run(
    `CREATE TABLE IF NOT EXISTS rooms (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        occupied INTEGER NOT NULL DEFAULT 0
     )`,
    (err) => {
      if (err) {
        console.error("Error creating rooms table:", err.message);
        return;
      }

      // 2. Kolla hur många rader som finns
      db.get("SELECT COUNT(*) AS count FROM rooms", (err, row) => {
        if (err) {
          console.error("Error counting rooms:", err.message);
          return;
        }

        // 3. Om tom → lägg in demo-rum
        if (row.count === 0) {
          db.run("INSERT INTO rooms (name) VALUES ('Room A')");
          db.run("INSERT INTO rooms (name) VALUES ('Room B')");
          db.run("INSERT INTO rooms (name) VALUES ('Room C')");
          console.log("Inserted demo rooms");
        }
      });
    }
  );
});

module.exports = db;

