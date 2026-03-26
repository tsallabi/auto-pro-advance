import Database from "better-sqlite3";

const db = new Database("auction.db");

try {
    db.exec("ALTER TABLE cars ADD COLUMN maxAuctionRetries INTEGER DEFAULT 1");
    console.log("Added maxAuctionRetries");
} catch (e) {
    console.log("maxAuctionRetries already exists", e.message);
}

try {
    db.exec("ALTER TABLE cars ADD COLUMN auctionSessionCount INTEGER DEFAULT 0");
    console.log("Added auctionSessionCount");
} catch (e) {
    console.log("auctionSessionCount already exists", e.message);
}

try {
    db.exec("ALTER TABLE cars ADD COLUMN auctionStartTime TEXT");
    console.log("Added auctionStartTime");
} catch (e) {
    console.log("auctionStartTime already exists", e.message);
}

console.log("Done.");
