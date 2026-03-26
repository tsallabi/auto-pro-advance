const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'auction.db'));
db.pragma('journal_mode = WAL');

// --- Helper Functions ---
function getAdmin() {
    return db.prepare("SELECT * FROM users WHERE role = 'admin' LIMIT 1").get();
}

function getOrAddSeller() {
    let seller = db.prepare("SELECT * FROM users WHERE role = 'seller' LIMIT 1").get();
    if (!seller) {
        db.prepare("INSERT INTO users (id, firstName, lastName, email, role, kycStatus, password) VALUES (?, ?, ?, ?, ?, ?, ?)")
            .run('seller-sim-1', 'Test', 'Seller', 'seller@auto.pro', 'seller', 'approved', 'pass123');
        seller = db.prepare("SELECT * FROM users WHERE id = 'seller-sim-1'").get();

        // Create Seller Wallet
        db.prepare("INSERT INTO seller_wallets (sellerId, availableBalance, pendingBalance, totalEarned, totalWithdrawn) VALUES (?, 0, 0, 0, 0)").run('seller-sim-1');
    }
    return seller;
}

function ensureBuyers(count = 5) {
    let buyers = [];
    for (let i = 1; i <= count; i++) {
        const id = `buyer-sim-${i}`;
        let buyer = db.prepare("SELECT * FROM users WHERE id = ?").get(id);
        if (!buyer) {
            db.prepare("INSERT INTO users (id, firstName, lastName, email, role, kycStatus, password) VALUES (?, ?, ?, ?, ?, ?, ?)")
                .run(id, 'Test', `Buyer ${i}`, `buyer${i}@auto.pro`, 'buyer', 'approved', 'pass123');

            // Create Buyer Wallet with Balance
            db.prepare("INSERT INTO buyer_wallets (userId, balance, totalDeposited, totalSpent) VALUES (?, ?, ?, 0)")
                .run(id, 50000, 50000); // 50k deposit

            buyer = db.prepare("SELECT * FROM users WHERE id = ?").get(id);
            console.log(`Created Buyer: ${buyer.firstName} ${buyer.lastName}`);
        } else {
            console.log(`Buyer exists: ${buyer.firstName} ${buyer.lastName}`);
        }
        buyers.push(buyer);
    }
    return buyers;
}

function insertCar(sellerId, make, model, year, image, index) {
    const id = `car-sim-${Date.now()}-${index}`;
    const lotNumber = `SIM-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date();
    const endDate = new Date(now.getTime() + (index + 1) * 60000); // 1-4 mins from now

    db.prepare(`
    INSERT INTO cars (
      id, lotNumber, make, model, year, vin, images, sellerId, status,
      startingBid, currentBid, reservePrice, auctionEndDate
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
        id, lotNumber, make, model, year, `VIN-SIM-${index}`, JSON.stringify([image]),
        sellerId, 'upcoming', 1000, 1000, 15000, endDate.toISOString()
    );
    console.log(`Inserted Car: ${year} ${make} ${model} (Lot: ${lotNumber}) by ${sellerId} as Upcoming`);
    return id;
}

// --- Main Simulation ---
async function runSimulation() {
    console.log("--- Starting End-to-End Simulation Setup ---");

    const admin = getAdmin();
    const seller = getOrAddSeller();
    console.log(`Admin ID: ${admin.id}, Seller ID: ${seller.id}`);

    console.log("\\n--- 1. Ensuring 5 Buyers with Wallets ---");
    const buyers = ensureBuyers(5);

    console.log("\\n--- 2. Inserting 4 Cars (2 Admin, 2 Seller) into Upcoming ---");
    const cars = [];
    cars.push(insertCar(admin.id, 'BMW', 'X5', 2022, 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80', 1));
    cars.push(insertCar(admin.id, 'Mercedes', 'C300', 2021, 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=800&q=80', 2));
    cars.push(insertCar(seller.id, 'Toyota', 'Camry', 2023, 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fd?auto=format&fit=crop&w=800&q=80', 3));
    cars.push(insertCar(seller.id, 'Honda', 'Accord', 2022, 'https://images.unsplash.com/photo-1594231665489-08deec2caafb?auto=format&fit=crop&w=800&q=80', 4));

    console.log("\\n--- Setup Complete! Next Step: Pre-Bidding ---");
}

runSimulation().catch(console.error);
