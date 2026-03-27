const Database = require("better-sqlite3");
const db = new Database("auction.db");
try {
  const schema = db.prepare("PRAGMA table_info(external_notifications)").all();
  console.log("external_notifications Schema:", JSON.stringify(schema, null, 2));
} catch (e) {
  console.error("Error:", e.message);
}
db.close();
