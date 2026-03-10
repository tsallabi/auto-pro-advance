import Database from "better-sqlite3";
const db = new Database("auction.db");

function seedProductionSimulation() {
    console.log("Preparing high-fidelity production simulation...");

    // 1. Create Sellers & Users
    const personas = [
        { id: 'seller-comp', name: 'Al-Madina Showroom', role: 'seller', email: 'merchant@automart.com' },
        { id: 'buyer-winner', name: 'Winner User', role: 'buyer', email: 'winner@autopro.com', deposit: 10000 },
        { id: 'buyer-offer', name: 'Offer User', role: 'buyer', email: 'offer@autopro.com', deposit: 5000 },
        { id: 'buyer-lost', name: 'Lost User', role: 'buyer', email: 'lost@autopro.com', deposit: 3000 },
        { id: 'buyer-pending', name: 'Pending User', role: 'buyer', email: 'pending@autopro.com', deposit: 2000 },
        { id: 'buyer-newbie', name: 'Newbie User', role: 'buyer', email: 'newbie@autopro.com', deposit: 1000 }
    ];

    personas.forEach(p => {
        db.prepare(`INSERT OR REPLACE INTO users (id, firstName, lastName, email, phone, password, role, status, deposit, buyingPower, joinDate)
                   VALUES (?, ?, ?, ?, '091000000', 'pass123', ?, 'active', ?, ?, '2025-01-01')`)
            .run(p.id, p.name, '', p.email, p.role, p.deposit || 0, (p.deposit || 0) * 10);
    });

    // 2. Add 10 Premium Cars
    const stock = [
        { id: 'sim-car-1', make: 'Mercedes', model: 'S-Class 2024', status: 'live', reserve: 80000 },
        { id: 'sim-car-2', make: 'BMW', model: 'X7 M60i', status: 'live', reserve: 75000 },
        { id: 'sim-car-3', make: 'Porsche', model: '911 Turbo S', status: 'live', reserve: 120000 },
        { id: 'sim-car-4', make: 'Toyota', model: 'Land Cruiser 300', status: 'upcoming', reserve: 90000 },
        { id: 'sim-car-5', make: 'Tesla', model: 'Model X Plaid', status: 'upcoming', reserve: 85000 },
        { id: 'sim-car-6', make: 'Range Rover', model: 'Autobiography', status: 'offer_market', reserve: 110000 },
        { id: 'sim-car-7', make: 'Audi', model: 'RSQ8', status: 'upcoming', reserve: 95000 },
        { id: 'sim-car-8', make: 'Lexus', model: 'LX 600', status: 'upcoming', reserve: 105000 },
        { id: 'sim-car-9', make: 'Ford', model: 'Raptor R', status: 'upcoming', reserve: 88000 },
        { id: 'sim-car-10', make: 'Ferrari', model: 'Roma', status: 'upcoming', reserve: 200000 }
    ];

    const carImages = [
        '1605559424843-9e4c228bf1c2', '1552519507-da3b142c6e3d', '1583121274602-3e2820c69888',
        '1503376780353-7e6692767b70', '1560958089-b8a1929cea89', '1619767886558-efcbdcecf122'
    ];

    stock.forEach((c, i) => {
        const images = JSON.stringify([`https://images.unsplash.com/photo-${carImages[i % carImages.length]}?auto=format&fit=crop&q=80&w=800`]);
        db.prepare(`INSERT OR REPLACE INTO cars (id, lotNumber, vin, make, model, year, odometer, engine, drive, primaryDamage, titleType, location, currentBid, status, images, reservePrice, sellerId)
                   VALUES (?, ?, ?, ?, ?, 2024, 0, 'V8', 'AWD', 'None', 'Clean', 'HQ Warehouse', ?, ?, ?, ?, 'seller-comp')`)
            .run(c.id, `LOT-${5000 + i}`, `VIN-${c.id}`, c.make, c.model, c.reserve * 0.8, c.status, images, c.reserve);
    });

    console.log("✅ Production seed complete.");
}

seedProductionSimulation();
