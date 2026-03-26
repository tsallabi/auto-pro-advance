const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'auction.db'));
db.pragma('journal_mode = WAL');

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function runPostAuctionSimulation() {
    console.log("--- Starting Phase 3, 4, 5 (Payment & Logistics Simulation) ---");

    // Phase 4: Buyer Pays Purchase Invoice -> Admin Confirms (if cash), Wallet (instant)
    console.log("\\n> Simulating Buyer Payments (Purchase Invoices)...");
    let invoices = db.prepare("SELECT * FROM invoices WHERE type = 'car_purchase' AND status = 'unpaid' AND carId LIKE 'car-sim-%'").all();

    if (invoices.length === 0) {
        console.log("No unpaid purchase invoices found for simulated cars.");
        // Maybe the live auction hasn't finished yet. Let's force finalize them if needed.
        const liveCars = db.prepare("SELECT * FROM cars WHERE id LIKE 'car-sim-%' AND status = 'live'").all();
        if (liveCars.length > 0) {
            console.log(`Forcing ${liveCars.length} live cars to close and generating invoices...`);
            liveCars.forEach(car => {
                const winnerId = car.currentBid > car.startingBid ?
                    (db.prepare("SELECT userId FROM bids WHERE carId = ? ORDER BY amount DESC LIMIT 1").get(car.id)?.userId) : null;

                db.prepare("UPDATE cars SET status = 'closed', winnerId = ? WHERE id = ?").run(winnerId, car.id);

                if (winnerId) {
                    // Create invoice
                    const invId = `inv-sim-${Date.now()}-${car.id}`;
                    db.prepare(`
                        INSERT INTO invoices (id, carId, userId, amount, type, status, timestamp) 
                        VALUES (?, ?, ?, ?, 'car_purchase', 'unpaid', ?)
                    `).run(invId, car.id, winnerId, car.currentBid + 500, new Date().toISOString());

                    console.log(`Generated Purchase Invoice for ${car.lotNumber} (Winner: ${winnerId})`);

                    // Create basic shipment
                    db.prepare(`
                        INSERT INTO shipments (id, carId, userId, status, createdAt)
                        VALUES (?, ?, ?, 'processing', ?)
                    `).run(`ship-sim-${Date.now()}-${car.id}`, car.id, winnerId, new Date().toISOString());
                }
            });
        }
        // re-fetch invoices
        invoices = db.prepare("SELECT * FROM invoices WHERE type = 'car_purchase' AND status = 'unpaid' AND carId LIKE 'car-sim-%'").all();
    }

    // Process Purchase Invoices
    for (let i = 0; i < invoices.length; i++) {
        const inv = invoices[i];

        // 50% Wallet, 50% Bank Transfer
        if (i % 2 === 0) {
            console.log(`   - Buyer ${inv.userId} pays Purchase Invoice ${inv.id} via WALLET`);
            db.prepare("UPDATE invoices SET status = 'paid', paidVia = 'wallet', paidAt = ? WHERE id = ?").run(new Date().toISOString(), inv.id);
            db.prepare("UPDATE buyer_wallets SET balance = balance - ?, totalSpent = totalSpent + ? WHERE userId = ?").run(inv.amount, inv.amount, inv.userId);

            // Generate Transport invoice right after Purchase is paid
            db.prepare(`
                INSERT INTO invoices (id, carId, userId, amount, type, status, timestamp) 
                VALUES (?, ?, ?, ?, 'transport', 'unpaid', ?)
            `).run(`inv-trans-sim-${Date.now()}-${inv.carId}`, inv.carId, inv.userId, 250, new Date().toISOString());

            // Add Admin Activity (as notification)
            db.prepare("INSERT INTO notifications (id, userId, title, message, type, timestamp) VALUES (?, 'admin-1', 'دفعة شراء مستلمة', ?, 'success', ?)").run(
                `notif-sim-${Date.now()}-${inv.id}`, `سداد فاتورة شراء فورية عبر المحفظة للسيارة ${inv.carId}`, new Date().toISOString()
            );

        } else {
            console.log(`   - Buyer ${inv.userId} pays Purchase Invoice ${inv.id} via BANK TRANSFER (Pending Admin)`);
            db.prepare("UPDATE invoices SET status = 'pending_admin_approval', paidVia = 'bank_transfer' WHERE id = ?").run(inv.id);

            console.log(`   - (Admin) Approving Bank Transfer for Invoice ${inv.id}`);
            db.prepare("UPDATE invoices SET status = 'paid', paidAt = ? WHERE id = ?").run(new Date().toISOString(), inv.id);

            db.prepare(`
                INSERT INTO invoices (id, carId, userId, amount, type, status, timestamp) 
                VALUES (?, ?, ?, ?, 'transport', 'unpaid', ?)
            `).run(`inv-trans-sim-${Date.now()}-${inv.carId}`, inv.carId, inv.userId, 250, new Date().toISOString());

            db.prepare("INSERT INTO notifications (id, userId, title, message, type, timestamp) VALUES (?, 'admin-1', 'اعتماد تحويل بنكي', ?, 'info', ?)").run(
                `notif-sim-admin-${Date.now()}-${inv.id}`, `اعتماد إداري لتحويل بنكي لفاتورة سيارة ${inv.carId}`, new Date().toISOString()
            );
        }
    }

    console.log("\\n> Simulating Transport and Shipping Invoices...");
    let transportInvoices = db.prepare("SELECT * FROM invoices WHERE type = 'transport' AND status = 'unpaid' AND carId LIKE 'car-sim-%'").all();

    for (const inv of transportInvoices) {
        console.log(`   - Buyer ${inv.userId} pays Transport Invoice`);
        db.prepare("UPDATE invoices SET status = 'paid', paidVia = 'wallet', paidAt = ? WHERE id = ?").run(new Date().toISOString(), inv.id);

        // Generate Shipping Invoice
        db.prepare(`
            INSERT INTO invoices (id, carId, userId, amount, type, status, timestamp) 
            VALUES (?, ?, ?, ?, 'shipping', 'unpaid', ?)
        `).run(`inv-ship-sim-${Date.now()}-${inv.carId}`, inv.carId, inv.userId, 1500, new Date().toISOString());

        // Update Shipment phase
        db.prepare("UPDATE shipments SET status = 'in_transit' WHERE carId = ?").run(inv.carId);
    }

    let shippingInvoices = db.prepare("SELECT * FROM invoices WHERE type = 'shipping' AND status = 'unpaid' AND carId LIKE 'car-sim-%'").all();
    for (const inv of shippingInvoices) {
        console.log(`   - Buyer ${inv.userId} pays Shipping Invoice`);
        db.prepare("UPDATE invoices SET status = 'paid', paidVia = 'wallet', paidAt = ? WHERE id = ?").run(new Date().toISOString(), inv.id);

        // Finalize Shipment
        db.prepare("UPDATE shipments SET status = 'delivered' WHERE carId = ?").run(inv.carId);

        db.prepare("INSERT INTO notifications (id, userId, title, message, type, timestamp) VALUES (?, 'admin-1', 'اكتمل التسليم', ?, 'success', ?)").run(
            `notif-sim-final-${Date.now()}-${inv.id}`, `تسليم السيارة ${inv.carId} بالكامل للعميل`, new Date().toISOString()
        );
    }

    console.log("\\n--- Simulation Phase 5 Complete! Delivery Finalized. ---");
}

runPostAuctionSimulation().catch(console.error);
