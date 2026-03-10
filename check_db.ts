import Database from 'better-sqlite3';
const db = new Database('auction.db');
const car = db.prepare("SELECT id, images FROM cars WHERE id LIKE 'sim-car-%' LIMIT 1").get();
console.log(JSON.stringify(car, null, 2));
