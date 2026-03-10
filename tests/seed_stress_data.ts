import Database from "better-sqlite3";

const db = new Database("auction.db");

function seedStressData() {
    console.log("Seeding stress testing data...");

    // 1. Create 100 Stress Test Users
    const users = [];
    for (let i = 1; i <= 100; i++) {
        const id = `stress-user-${i}`;
        const userData = {
            id,
            firstName: "Stress",
            lastName: `User ${i}`,
            email: `stress${i}@autopro.com`,
            phone: `+218-91-${1000000 + i}`,
            password: "password123",
            role: "buyer",
            status: "active",
            kycStatus: "verified",
            deposit: 1000000,
            buyingPower: 10000000,
            joinDate: new Date().toISOString()
        };

        try {
            db.prepare(`
        INSERT OR REPLACE INTO users (id, firstName, lastName, email, phone, password, role, status, kycStatus, deposit, buyingPower, joinDate)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
                userData.id, userData.firstName, userData.lastName, userData.email, userData.phone,
                userData.password, userData.role, userData.status, userData.kycStatus,
                userData.deposit, userData.buyingPower, userData.joinDate
            );
        } catch (err) {
            console.error(`Error seeding user ${id}:`, err);
        }
    }

    // 2. Create 5 Live Cars for Stress Testing
    for (let i = 1; i <= 5; i++) {
        const id = `stress-car-${i}`;
        const carData = {
            id,
            lotNumber: `STR-${1000 + i}`,
            vin: `VIN-STR-${1000 + i}`,
            make: "Stress",
            model: `Model ${i}`,
            year: 2025,
            odometer: 100,
            engine: "Electric",
            drive: "AWD",
            primaryDamage: "None",
            titleType: "Clean Title",
            location: "Stress Test Lab",
            currentBid: 1000,
            status: "live",
            images: JSON.stringify(["https://images.unsplash.com/photo-1503376780353-7e6692767b70"]),
            reservePrice: 50000
        };

        try {
            db.prepare(`
        INSERT OR REPLACE INTO cars (id, lotNumber, vin, make, model, year, odometer, engine, drive, primaryDamage, titleType, location, currentBid, status, images, reservePrice)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
                carData.id, carData.lotNumber, carData.vin, carData.make, carData.model, carData.year,
                carData.odometer, carData.engine, carData.drive, carData.primaryDamage, carData.titleType,
                carData.location, carData.currentBid, carData.status, carData.images, carData.reservePrice
            );
        } catch (err) {
            console.error(`Error seeding car ${id}:`, err);
        }
    }

    console.log("✅ Seeded 100 stress users and 5 live stress cars.");
}

seedStressData();
