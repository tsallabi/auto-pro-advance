import Database from 'better-sqlite3';

const db = new Database('auction.db');

async function runExperiment() {
    console.log("🚀 Starting Real System Experiment...");

    // 1. Register 3 New Buyers
    const users = [
        { id: 'tester-1', firstName: 'المهدي', lastName: 'الورفلي', email: 'mahdi@test.com', phone: '0911001100', role: 'buyer', status: 'active', deposit: 2000, buyingPower: 20000 },
        { id: 'tester-2', firstName: 'سفيان', lastName: 'الغرياني', email: 'sofian@test.com', phone: '0922002200', role: 'buyer', status: 'active', deposit: 5000, buyingPower: 50000 },
        { id: 'tester-3', firstName: 'حسام', lastName: 'القمودي', email: 'hossam@test.com', phone: '0933003300', role: 'buyer', status: 'active', deposit: 1000, buyingPower: 10000 }
    ];

    for (const u of users) {
        db.prepare(`INSERT OR REPLACE INTO users (id, firstName, lastName, email, phone, password, role, status, deposit, buyingPower, joinDate)
      VALUES (?, ?, ?, ?, ?, 'test123', ?, ?, ?, ?, ?)`).run(u.id, u.firstName, u.lastName, u.email, u.phone, u.role, u.status, u.deposit, u.buyingPower, new Date().toISOString());

        // Auto-create wallet
        db.prepare(`INSERT OR IGNORE INTO buyer_wallets (userId, balance, reservedAmount, totalDeposited, totalSpent, updatedAt)
      VALUES (?, ?, 0, ?, 0, ?)`).run(u.id, u.deposit, u.deposit, new Date().toISOString());

        // 2. Upload KYC Mock
        db.prepare(`INSERT OR REPLACE INTO kyc_documents (id, userId, type, status, submittedAt) VALUES (?, ?, 'id_card', 'approved', ?)`).run(`kyc-${u.id}`, u.id, new Date().toISOString());
        console.log(`✅ User ${u.firstName} Registered & KYC Approved.`);
    }

    // 3. Add 4 Test Cars
    const cars = [
        { id: 'exp-car-1', make: 'Mercedes-Benz', model: 'S580', year: 2023, lotNumber: 'EXP-101', reservePrice: 85000, currentBid: 80000, status: 'live' },
        { id: 'exp-car-2', make: 'BMW', model: 'X7', year: 2024, lotNumber: 'EXP-102', reservePrice: 95000, currentBid: 70000, status: 'live' },
        { id: 'exp-car-3', make: 'Toyota', model: 'Land Cruiser', year: 2022, lotNumber: 'EXP-103', reservePrice: 60000, currentBid: 55000, status: 'live' },
        { id: 'exp-car-4', make: 'Audi', model: 'RS7', year: 2023, lotNumber: 'EXP-104', reservePrice: 110000, currentBid: 105000, status: 'live' }
    ];

    for (const c of cars) {
        db.prepare(`INSERT OR REPLACE INTO cars (id, make, model, year, lotNumber, reservePrice, currentBid, status, currency, images)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'USD', '["https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8"]')`).run(c.id, c.make, c.model, c.year, c.lotNumber, c.reservePrice, c.currentBid, c.status);
        console.log(`🚗 Car ${c.make} ${c.model} Added to Inventory.`);
    }

    console.log("\n--- SHENANIGANS STARTING (Bidding) ---\n");

    // SCENARIO 1: Competition for Mercedes S580 (Reserve 85k)
    // Tester 1 bids 82k
    db.prepare("INSERT INTO bids (id, carId, userId, amount, timestamp) VALUES (?,?,?,?,?)").run('b1-1', 'exp-car-1', 'tester-1', 82000, new Date().toISOString());
    db.prepare("UPDATE cars SET currentBid = 82000, winnerId = 'tester-1' WHERE id = 'exp-car-1'").run();
    console.log("⏱️ Tester 1 bids $82,000 on Mercedes S580.");

    // Tester 2 outbids with 86k (Reserve met!)
    db.prepare("INSERT INTO bids (id, carId, userId, amount, timestamp) VALUES (?,?,?,?,?)").run('b1-2', 'exp-car-1', 'tester-2', 86000, new Date().toISOString());
    db.prepare("UPDATE cars SET currentBid = 86000, winnerId = 'tester-2' WHERE id = 'exp-car-1'").run();
    console.log("🔥 Tester 2 OUTBIDS Tester 1 with $86,000! (Reserve Met)");

    // SCENARIO 2: BMW X7 (Reserve NOT met)
    // Tester 3 bids 80k
    db.prepare("INSERT INTO bids (id, carId, userId, amount, timestamp) VALUES (?,?,?,?,?)").run('b2-1', 'exp-car-2', 'tester-3', 80000, new Date().toISOString());
    db.prepare("UPDATE cars SET currentBid = 80000, winnerId = 'tester-3' WHERE id = 'exp-car-2'").run();
    console.log("❄️ Tester 3 bids $80,000 on BMW X7. (Below Reserve)");

    // 4. CLOSING AUCTIONS & TRIGGERING LOGIC
    console.log("\n--- FINALIZING AUCTIONS ---\n");

    // Finalize Car 1 (Tester 2 wins)
    db.prepare("UPDATE cars SET status = 'closed' WHERE id = 'exp-car-1'").run();
    const c1 = db.prepare("SELECT * FROM cars WHERE id = 'exp-car-1'").get() as any;
    // Manual trigger of invoices (to simulate finalizeAuction logic)
    const invId = `inv-pur-exp1`;
    db.prepare(`INSERT INTO invoices(id, userId, carId, amount, status, type, timestamp) VALUES(?, ?, ?, ?, 'unpaid', 'purchase', ?)`).run(invId, 'tester-2', 'exp-car-1', 86000 * 1.07, new Date().toISOString());
    console.log(`🏆 Car 1 SOLD to Tester 2 ($86,000). Invoice Created.`);

    // Finalize Car 2 (Moves to Offer Market)
    const offerEnd = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString();
    db.prepare("UPDATE cars SET status = 'offer_market', offerMarketEndTime = ? WHERE id = 'exp-car-2'").run(offerEnd);
    console.log(`🔄 Car 2 moved to OFFER MARKET (Reserve not met).`);

    // 5. POST-AUCTION STEPS (Tester 2 pays and requests shipping)
    db.prepare("UPDATE invoices SET status = 'paid', paidAt = ? WHERE id = ?").run(new Date().toISOString(), invId);
    db.prepare(`INSERT INTO shipments(id, carId, userId, status, createdAt) VALUES(?, ?, ?, 'processing', ?)`).run('ship-exp1', 'exp-car-1', 'tester-2', new Date().toISOString());
    console.log(`💰 Tester 2 PAID purchase invoice. Shipment status: PROCESSING.`);

    // System Messages
    db.prepare(`INSERT INTO messages(id, senderId, receiverId, subject, content, timestamp) VALUES (?,?,?,?,?,?)`)
        .run('msg-exp1', 'admin-1', 'tester-2', '✅ تم دفع الفاتورة', 'شكراً لك! لقد استلمنا دفعتك لسيارة مرسيدس S580. سيتم نقله الآن إلى المستودع.', new Date().toISOString());
    console.log(`📧 Confirmation message sent to Tester 2.`);

    console.log("\n✅ Experiment Complete. All records preserved in auction.db.");
}

runExperiment().catch(console.error);
