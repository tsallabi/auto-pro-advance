const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'auction.db'));
db.pragma('journal_mode = WAL');

// --- Helper Functions ---
function getSimCars() {
    return db.prepare("SELECT * FROM cars WHERE id LIKE 'car-sim-%' AND status = 'upcoming'").all();
}

function getSimBuyers() {
    return db.prepare("SELECT * FROM users WHERE id LIKE 'buyer-sim-%'").all();
}

function insertBid(carId, userId, amount, type) {
    const id = `bid-sim-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    db.prepare(`
    INSERT INTO bids (id, carId, userId, amount, timestamp, type)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, carId, userId, amount, new Date().toISOString(), type);

    // Update car currentBid
    db.prepare("UPDATE cars SET currentBid = ? WHERE id = ?").run(amount, carId);
    return amount;
}

// --- Main Simulation ---
async function runPrebidding() {
    console.log("--- Starting Pre-Bidding (Upcoming) Simulation ---");

    const cars = getSimCars();
    const buyers = getSimBuyers();

    if (cars.length === 0 || buyers.length === 0) {
        console.error("Missing simulated cars or buyers. Run Phase 1 setup first.");
        return;
    }

    console.log(`Found ${cars.length} cars and ${buyers.length} buyers.`);

    for (let i = 0; i < cars.length; i++) {
        const car = cars[i];
        console.log(`\\n> Simulating Pre-Bids for ${car.year} ${car.make} ${car.model} (Lot: ${car.lotNumber})`);

        let currentPrice = car.startingBid || 1000;

        // 3 buyers place pre-bids
        const bidders = [buyers[i % 5], buyers[(i + 1) % 5], buyers[(i + 2) % 5]];

        // Bid 1
        currentPrice += 1500;
        insertBid(car.id, bidders[0].id, currentPrice, 'manual');
        console.log(`   - ${bidders[0].firstName} ${bidders[0].lastName} placed a pre-bid: $${currentPrice}`);

        // Bid 2
        currentPrice += 2000;
        insertBid(car.id, bidders[1].id, currentPrice, 'manual');
        console.log(`   - ${bidders[1].firstName} ${bidders[1].lastName} placed a pre-bid: $${currentPrice}`);

        // Bid 3 (Proxy/Max Bid that bumps the price up)
        currentPrice += 3500;
        insertBid(car.id, bidders[2].id, currentPrice, 'proxy');
        console.log(`   - ${bidders[2].firstName} ${bidders[2].lastName} placed a Proxy Bid reaching: $${currentPrice}`);

        // Final Pre-Bid
        currentPrice += 1000;
        insertBid(car.id, bidders[0].id, currentPrice, 'manual');
        console.log(`   - ${bidders[0].firstName} ${bidders[0].lastName} took the lead with: $${currentPrice}`);

        console.log(`   => Final Pre-Bid status for ${car.lotNumber}: $${currentPrice}`);
    }

    console.log("\\n--- Pre-Bidding Complete! Cars are ready to go 'live'. ---");
}

runPrebidding().catch(console.error);
