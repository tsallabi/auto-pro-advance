import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, "auction.db");

console.log("Starting Migration v2 for 'cars' table...");

if (!fs.existsSync(dbPath)) {
    console.error("auction.db not found. Run server.ts first to initialize.");
    process.exit(1);
}

const db = new Database(dbPath);

const newColumns = [
    { name: 'auctionLane', type: 'TEXT' },
    { name: 'showroomName', type: 'TEXT' },
    { name: 'actualOdometer', type: 'TEXT DEFAULT "yes"' },
    { name: 'startingBid', type: 'REAL DEFAULT 0' },
    { name: 'cylinders', type: 'INTEGER' },
    { name: 'saleStatus', type: 'TEXT' },
    { name: 'specialNote', type: 'TEXT' },
    { name: 'locationDetails', type: 'TEXT' },
    { name: 'exchangeRate', type: 'REAL DEFAULT 1' },
    { name: 'minPrice', type: 'REAL DEFAULT 0' },
    { name: 'engineVideoUrl', type: 'TEXT' },
    { name: 'engineAudioUrl', type: 'TEXT' }
];

try {
    const tableInfo = db.prepare("PRAGMA table_info(cars)").all();
    const existingColumns = tableInfo.map(col => col.name);

    let addedCount = 0;
    for (const col of newColumns) {
        if (!existingColumns.includes(col.name)) {
            console.log(`Adding column: ${col.name} (${col.type})`);
            db.prepare(`ALTER TABLE cars ADD COLUMN ${col.name} ${col.type}`).run();
            addedCount++;
        } else {
            console.log(`Column ${col.name} already exists. Skipping.`);
        }
    }

    console.log(`Migration Complete. Added ${addedCount} columns.`);
} catch (error) {
    console.error("Migration failed:", error);
} finally {
    db.close();
}
