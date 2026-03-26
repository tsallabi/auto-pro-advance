import Database from "better-sqlite3";

const db = new Database("auction.db");

try {
    db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `);
    console.log("Settings table created successfully");
} catch (e) {
    console.error("Error creating settings table:", e);
}
