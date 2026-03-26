import Database from 'better-sqlite3';

const db = new Database('auction.db');

console.log('Automated Auction Cycle Initialization...');

// Ensure admin-1 has a lot of buying power to test bidding
db.prepare("UPDATE users SET buyingPower = 50000000 WHERE id = 'admin-1'").run();

// Reset all cars to 'upcoming' so they can enter the new continuous cycle.
db.prepare("UPDATE cars SET status = 'upcoming', winnerId = NULL, currentBid = reservePrice * 0.5").run();

// Stagger the auction start dates by 1 minute each
const cars = db.prepare("SELECT id FROM cars ORDER BY CAST(lotNumber AS INTEGER) ASC").all();

let minutesOffset = 1;
for (const car of cars) {
    const nextDate = new Date(Date.now() + (minutesOffset * 60 * 1000)).toISOString();
    db.prepare("UPDATE cars SET auctionEndDate = ? WHERE id = ?").run(nextDate, car.id);
    minutesOffset += 1;
}

const upcomingCount = db.prepare("SELECT COUNT(*) as count FROM cars WHERE status = 'upcoming'").get().count;

console.log(`Cycle Initialization complete. ${upcomingCount} cars placed in the Upcoming queue with staggered start times.`);
console.log(`First car will enter Live Auction in 1 minute. Followed by the next car every minute.`);

db.close();
