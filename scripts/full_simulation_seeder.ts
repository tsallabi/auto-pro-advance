import Database from "better-sqlite3";
import crypto from "crypto";

// ... inside functions replace crypto.randomUUID() with crypto.randomUUID()

const db = new Database("auction.db");

function seed() {
    console.log("🚀 Starting Full Simulation Seeding...");

    // 1. Create Buyers
    const buyers = [
        { id: "buyer-1", firstName: "خالد", lastName: "المنفي", email: "buyer1@test.com", phone: "0911111111", password: "user123", role: "buyer", status: "active", deposit: 10000, buyingPower: 100000 },
        { id: "buyer-2", firstName: "أحمد", lastName: "الورفلي", email: "buyer2@test.com", phone: "0922222222", password: "user123", role: "buyer", status: "active", deposit: 15000, buyingPower: 150000 },
        { id: "buyer-3", firstName: "مصطفى", lastName: "القمودي", email: "buyer3@test.com", phone: "0933333333", password: "user123", role: "buyer", status: "active", deposit: 5000, buyingPower: 50000 },
        { id: "buyer-4", firstName: "سالم", lastName: "الزنتاني", email: "buyer4@test.com", phone: "0944444444", password: "user123", role: "buyer", status: "active", deposit: 20000, buyingPower: 200000 },
        { id: "buyer-5", firstName: "عمر", lastName: "المختار", email: "buyer5@test.com", phone: "0955555555", password: "user123", role: "buyer", status: "active", deposit: 500, buyingPower: 5000 },
    ];

    for (const buyer of buyers) {
        db.prepare(`
            INSERT OR REPLACE INTO users (id, firstName, lastName, email, phone, password, role, status, deposit, buyingPower, joinDate)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(buyer.id, buyer.firstName, buyer.lastName, buyer.email, buyer.phone, buyer.password, buyer.role, buyer.status, buyer.deposit, buyer.buyingPower, new Date().toISOString());
    }

    // 2. Add 20 Premium Cars
    const carMakes = ['Mercedes-Benz', 'BMW', 'Toyota', 'Porsche', 'Audi', 'Lexus', 'Land Rover', 'Jeep'];
    const carModels: Record<string, string[]> = {
        'Mercedes-Benz': ['S580', 'G63 AMG', 'E350', 'GLE 53'],
        'BMW': ['760Li', 'X7 M60i', 'M4 Competition', 'iX'],
        'Toyota': ['Land Cruiser 300', 'Camry SE', 'Avalon', 'Supra'],
        'Porsche': ['911 Turbo S', 'Cayenne Coupe', 'Panamera', 'Taycan'],
        'Audi': ['RS7', 'Q8 E-tron', 'A8L', 'RSQ8'],
        'Lexus': ['LX600', 'LS500h', 'RX350', 'LC500'],
        'Land Rover': ['Range Rover Autobiography', 'Defender 110 V8', 'Sport', 'Velar'],
        'Jeep': ['Grand Wagoneer', 'Wrangler Rubicon', 'Grand Cherokee L', 'Gladiator']
    };

    const images = [
        "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?q=80&w=800",
        "https://images.unsplash.com/photo-1555353540-64fd1b6226f7?q=80&w=800",
        "https://images.unsplash.com/photo-1583121274602-3e2820c69888?q=80&w=800",
        "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=800"
    ];

    for (let i = 1; i <= 20; i++) {
        const make = carMakes[i % carMakes.length];
        const models = carModels[make];
        const model = models[i % models.length];
        const id = `sim-car-${i}`;

        let status = 'upcoming';
        if (i <= 5) status = 'live';
        if (i > 15) status = 'offer_market';

        db.prepare(`
            INSERT OR REPLACE INTO cars (
                id, lotNumber, vin, make, model, year, odometer, engineSize, horsepower,
                transmission, drivetrain, fuelType, exteriorColor, interiorColor,
                primaryDamage, secondaryDamage, titleType, location, currentBid,
                reservePrice, buyItNow, status, images, sellerId, auctionEndDate,
                keys, runsDrives, notes, mileageUnit
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            id,
            (70000000 + i).toString(),
            `SIMVIN${i}${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
            make, model, 2022 + (i % 3), 1500 * i, "4.0L V8", "500 hp",
            "Automatic", "AWD", "Gasoline", "Obsidian Black", "Nappa Leather",
            "None", "None", "Clean Title", "Dubai, UAE", i * 2000,
            i * 5000 + 10000, i * 6000 + 20000, status, JSON.stringify(images),
            "seller-1", new Date(Date.now() + 3600000).toISOString(),
            "Yes", "Yes", "سيارة ممتازة بحالة الوكالة - تجربة محاكاة", "km"
        );
    }

    // 3. Create Scenarios
    console.log("🛠️ Simulating Scenarios...");

    // Scenario 1: Buyer 1 wins Car 1
    const car1Id = "sim-car-1";
    const amount1 = 45000;
    db.prepare("UPDATE cars SET status = 'closed', winnerId = ?, currentBid = ? WHERE id = ?").run("buyer-1", amount1, car1Id);
    createInvoices("buyer-1", car1Id, amount1);

    // Scenario 2: Buyer 2 offer accepted for Car 16
    const car16Id = "sim-car-16";
    const amount16 = 55000;
    db.prepare("UPDATE cars SET status = 'closed', winnerId = ?, currentBid = ? WHERE id = ?").run("buyer-2", amount16, car16Id);
    createInvoices("buyer-2", car16Id, amount16);
    sendInternalMessage("admin-1", "buyer-2", "🏆 تم قبول عرضك!", "تمت الموافقة على عرضك لسيارة " + car16Id + " بمبلغ $" + amount16);

    // Scenario 3: Buyer 3 lost Car 2 (which moved to offer_market)
    const car2Id = "sim-car-2";
    db.prepare("UPDATE cars SET status = 'offer_market', currentBid = 35000, reservePrice = 40000, offerMarketEndTime = ? WHERE id = ?")
        .run(new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), car2Id);
    db.prepare("INSERT INTO bids (id, carId, userId, amount, timestamp) VALUES (?, ?, ?, ?, ?)").run(crypto.randomUUID(), car2Id, "buyer-3", 35000, new Date().toISOString());
    sendNotification("buyer-3", "😔 المزاد لم يصل للسعر المطلوب", "سيارة " + car2Id + " انتقلت لسوق العروض، يمكنك تقديم عرض جديد هناك!");

    // Scenario 4: Buyer 4 waiting for Admin on Car 17
    const car17Id = "sim-car-17";
    db.prepare("UPDATE cars SET status = 'offer_market', currentBid = 62000 WHERE id = ?").run(car17Id);
    db.prepare("INSERT INTO bids (id, carId, userId, amount, timestamp) VALUES (?, ?, ?, ?, ?)").run(crypto.randomUUID(), car17Id, "buyer-4", 62000, new Date().toISOString());
    sendInternalMessage("buyer-4", "admin-1", "طلب شراء | سيارة " + car17Id, "لقد قدمت عرضاً بقيمة $62,000 وأنتظر موافقتكم.");

    // Scenario 5: Buyer 5 recommendations
    sendNotification("buyer-5", "💡 فرص جديدة بانتظاركم", "لم يحالفك الحظ اليوم؟ شاهد هذه السيارات المميزة التي تناسب ميزانيتك!");

    console.log("✅ Simulation Seeding Complete!");
}

function createInvoices(userId: string, carId: string, amount: number) {
    const now = new Date().toISOString();
    const dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    // Purchase Invoice
    db.prepare("INSERT INTO invoices (id, userId, carId, amount, status, type, timestamp, dueDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
        .run(`inv-p-${crypto.randomUUID().substr(0, 8)}`, userId, carId, amount, "unpaid", "purchase", now, dueDate);

    // Transport
    db.prepare("INSERT INTO invoices (id, userId, carId, amount, status, type, timestamp, dueDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
        .run(`inv-t-${crypto.randomUUID().substr(0, 8)}`, userId, carId, 450, "pending", "transport", now, dueDate);

    // Shipping
    db.prepare("INSERT INTO invoices (id, userId, carId, amount, status, type, timestamp, dueDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
        .run(`inv-s-${crypto.randomUUID().substr(0, 8)}`, userId, carId, 1200, "pending", "shipping", now, dueDate);

    // Shipment tracker
    db.prepare("INSERT INTO shipments (id, carId, userId, status, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)")
        .run(`ship-${crypto.randomUUID().substr(0, 8)}`, carId, userId, "awaiting_payment", now, now);
}

function sendInternalMessage(senderId: string, receiverId: string, subject: string, content: string) {
    db.prepare("INSERT INTO messages (id, senderId, receiverId, subject, content, timestamp, category) VALUES (?, ?, ?, ?, ?, ?, ?)")
        .run(crypto.randomUUID(), senderId, receiverId, subject, content, new Date().toISOString(), "general");
}

function sendNotification(userId: string, title: string, message: string) {
    db.prepare("INSERT INTO notifications (id, userId, title, message, type, timestamp) VALUES (?, ?, ?, ?, ?, ?)")
        .run(crypto.randomUUID(), userId, title, message, "info", new Date().toISOString());
}

try {
    seed();
} catch (err) {
    console.error("❌ Seeding failed:", err);
}
