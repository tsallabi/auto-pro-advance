import Database from 'better-sqlite3';

const db = new Database('auction.db');

// Helper to generate unique IDs with prefix
const genId = (prefix: string) => `${prefix}-${Math.random().toString(36).substr(2, 9)}`;

function runSimulation() {
    console.log("🚀 Starting Full Auction Simulation Test...");

    // 1. Create Buyers
    const buyers = [
        { id: 'sim-buyer-1', firstName: 'سالم', lastName: 'المبروك', email: 'buyer1@test.com', phone: '0910001111' },
        { id: 'sim-buyer-2', firstName: 'عادل', lastName: 'الورفلي', email: 'buyer2@test.com', phone: '0910002222' },
        { id: 'sim-buyer-3', firstName: 'منصور', lastName: 'القذافي', email: 'buyer3@test.com', phone: '0910003333' },
        { id: 'sim-buyer-4', firstName: 'هيثم', lastName: 'جمعة', email: 'buyer4@test.com', phone: '0910004444' },
        { id: 'sim-buyer-5', firstName: 'عبدالرؤوف', lastName: 'بن علي', email: 'buyer5@test.com', phone: '0910005555' },
    ];

    for (const b of buyers) {
        db.prepare(`
      INSERT OR REPLACE INTO users (id, firstName, lastName, email, phone, password, role, status, joinDate, buyingPower, deposit)
      VALUES (?, ?, ?, ?, ?, 'pass123', 'buyer', 'active', ?, 100000, 10000)
    `).run(b.id, b.firstName, b.lastName, b.email, b.phone, new Date().toISOString());
    }
    console.log("✅ 5 Buyer personas created.");

    // 2. Create 20 Cars
    const makes = ['Mercedes-Benz', 'BMW', 'Audi', 'Range Rover', 'Toyota', 'Lexus', 'Porsche'];
    const models = ['S580', 'M5 Competition', 'RS7', 'Vogue', 'Land Cruiser 300', 'LX600', '911 Turbo S'];
    const locations = ['Dubai, UAE', 'Newark, NJ', 'Houston, TX', 'Tripoli, Libya', 'Benghazi, Libya'];

    for (let i = 1; i <= 20; i++) {
        const carId = `sim-car-${i}`;
        const make = makes[i % makes.length];
        const model = models[i % models.length];
        const reserve = 40000 + (i * 2000);
        const images = JSON.stringify([
            `https://images.unsplash.com/photo-${1605559424843 + i}?auto=format&fit=crop&q=80&w=800`
        ]);

        db.prepare(`
      INSERT OR REPLACE INTO cars (
        id, lotNumber, vin, make, model, year, odometer, engine, drive, 
        primaryDamage, titleType, location, currentBid, status, images, reservePrice
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, '4.0L V8', 'AWD', 'None', 'Clean Title', ?, ?, ?, ?, ?)
    `).run(
            carId,
            `LOT-SIM-${1000 + i}`,
            `VIN-SIM-${make.slice(0, 3)}-${i}`,
            make, model, 2023, 500 * i,
            locations[i % locations.length],
            reserve - 5000,
            i <= 5 ? 'closed' : 'live',
            images,
            reserve
        );
    }
    console.log("✅ 20 Cars added to inventory.");

    const now = new Date().toISOString();
    const ts = Date.now();

    // --- SCENARIO 1: Buyer 1 Wins Live ---
    const b1 = buyers[0];
    const c1 = 'sim-car-1';
    db.prepare("UPDATE cars SET status = 'closed', winnerId = ?, currentBid = 45000 WHERE id = ?").run(b1.id, c1);

    // Create Invoices
    db.prepare(`INSERT INTO invoices (id, userId, carId, amount, status, type, timestamp, dueDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run(
        `inv-win-1-1-${ts}`, b1.id, c1, 45000, 'unpaid', 'purchase', now, now
    );
    db.prepare(`INSERT INTO invoices (id, userId, carId, amount, status, type, timestamp, dueDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run(
        `inv-win-1-2-${ts}`, b1.id, c1, 1200, 'pending', 'transport', now, now
    );
    db.prepare(`INSERT INTO invoices (id, userId, carId, amount, status, type, timestamp, dueDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run(
        `inv-win-1-3-${ts}`, b1.id, c1, 2500, 'pending', 'shipping', now, now
    );

    // Notification
    db.prepare(`INSERT INTO notifications (id, userId, title, message, type, timestamp) VALUES (?, ?, ?, ?, ?, ?)`).run(
        `notif-win-1-${ts}`, b1.id, 'تهانينا! فوز بالمزاد 🎉', 'لقد فزت بتزايد سيارة Mercedes S580. تفقد قسم الفواتير.', 'success', now
    );

    // --- SCENARIO 2: Buyer 2 Offer Accepted ---
    const b2 = buyers[1];
    const c2 = 'sim-car-2';
    db.prepare("UPDATE cars SET status = 'closed', winnerId = ?, currentBid = 38000 WHERE id = ?").run(b2.id, c2);
    db.prepare(`INSERT INTO invoices (id, userId, carId, amount, status, type, timestamp, dueDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run(
        `inv-off-2-${ts}`, b2.id, c2, 38000, 'unpaid', 'purchase', now, now
    );
    db.prepare(`INSERT INTO notifications (id, userId, title, message, type, timestamp) VALUES (?, ?, ?, ?, ?, ?)`).run(
        `notif-off-2-${ts}`, b2.id, 'تم قبول عرضك! ✅', 'وافقت الإدارة على عرضك لشراء BMW M5.', 'success', now
    );

    // --- SCENARIO 3: Buyer 3 Lost -> Offer Market ---
    const b3 = buyers[2];
    const c3 = 'sim-car-3';
    db.prepare("UPDATE cars SET status = 'offer_market', currentBid = 32000, offerMarketEndTime = ? WHERE id = ?").run(
        new Date(Date.now() + 172800000).toISOString(), c3
    ); // 2 days
    db.prepare(`INSERT INTO notifications (id, userId, title, message, type, timestamp) VALUES (?, ?, ?, ?, ?, ?)`).run(
        `notif-lost-3-${ts}`, b3.id, 'فرصة أخيرة! 🕒', 'لم ينتهِ المزاد لصالحك، لكن السيارة الآن في سوق العروض. قدم عرضاً الآن!', 'info', now
    );

    // --- SCENARIO 4: Buyer 4 Pending Approval ---
    const b4 = buyers[3];
    const c4 = 'sim-car-4';
    db.prepare("UPDATE cars SET status = 'offer_market', currentBid = 29000 WHERE id = ?").run(c4);
    db.prepare(`INSERT INTO notifications (id, userId, title, message, type, timestamp) VALUES (?, ?, ?, ?, ?, ?)`).run(
        `notif-pend-4-${ts}`, b4.id, 'عرضك قيد المراجعة ⏳', 'تم استلام عرضك بقيمة $29,000 وهو بانتظار موافقة الإدارة.', 'info', now
    );

    // --- SCENARIO 5: Buyer 5 Encouragement ---
    const b5 = buyers[4];
    db.prepare(`INSERT INTO notifications (id, userId, title, message, type, timestamp) VALUES (?, ?, ?, ?, ?, ?)`).run(
        `notif-enc-5-${ts}`, b5.id, 'لا تستسلم! 🚗', 'شاهدنا اهتمامك بمزاد Mercedes. هناك سيارات مشابهة ستدخل المزاد غداً، تفقدها!', 'info', now
    );

    // --- Add Global Messages for inter-departmental communication test ---
    db.prepare(`INSERT INTO messages (id, senderId, receiverId, subject, content, timestamp, category) VALUES (?, ?, ?, ?, ?, ?, ?)`).run(
        `msg-sim-1-${ts}`, 'admin-1', b1.id, 'استكمال الشحن', 'يرجى تزويدنا بعنوان التوصيل النهائي في طرابلس لتأكيد فاتورة الشحن.', now, 'logistics'
    );
    db.prepare(`INSERT INTO messages (id, senderId, receiverId, subject, content, timestamp, category) VALUES (?, ?, ?, ?, ?, ?, ?)`).run(
        `msg-sim-2-${ts}`, b1.id, 'admin-1', 'تأكيد الدفع', 'لقد قمت بتحويل مبلغ فاتورة الشراء عبر المصرف، يرجى التأكيد.', now, 'financial'
    );

    console.log("🏁 Simulation seeding completed successfully!");
}

runSimulation();
