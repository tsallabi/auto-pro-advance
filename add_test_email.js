import Database from 'better-sqlite3';

const db = new Database('./auction.db');

const email = 'tsallabi@yahoo.ca';

const existingUser = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

if (existingUser) {
    console.log(`User ${email} already exists in the database.`);
} else {
    // We add them as a 'user' role
    db.prepare(`
        INSERT INTO users (id, firstName, lastName, email, phone, role, status, joinDate, limitCars, limitBids, deposit, buyingPower, kycStatus)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
        'user-' + Date.now(),
        'طارق',
        'الصلابي',
        email,
        '',
        'user',
        'active',
        new Date().toISOString(),
        5,
        5,
        0,
        0,
        'approved'
    );
    console.log(`Successfully added ${email} to the database.`);
}
