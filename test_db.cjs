const db = require('better-sqlite3')('auction.db');

try {
    console.log('Testing wonCars...');
    const wonCars = db.prepare(`SELECT cars.* FROM cars LEFT JOIN users ON cars.winnerId = users.id WHERE cars.status = 'closed' AND cars.winnerId IS NOT NULL`).all();
    wonCars.forEach(c => {
        try {
            JSON.parse(c.images || '[]');
        } catch (e) {
            console.log(`Error parsing images for wonCar ID: ${c.id}, images: ${c.images}`);
        }
    });

    console.log('Testing offerCars...');
    const offerCars = db.prepare(`SELECT cars.* FROM cars WHERE cars.status = 'offer_market'`).all();
    offerCars.forEach(c => {
        try {
            JSON.parse(c.images || '[]');
        } catch (e) {
            console.log(`Error parsing images for offerCar ID: ${c.id}, images: ${c.images}`);
        }
    });

    console.log('Testing scheduledCars...');
    const scheduledCars = db.prepare(`SELECT * FROM cars WHERE status IN ('upcoming', 'live', 'pending_approval')`).all();
    scheduledCars.forEach(c => {
        try {
            JSON.parse(c.images || '[]');
        } catch (e) {
            console.log(`Error parsing images for scheduledCar ID: ${c.id}, images: ${c.images}`);
        }
    });

    console.log('Done checking images JSON.');

} catch (e) {
    console.error('Query Error:', e);
}
