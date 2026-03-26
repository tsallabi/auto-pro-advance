const Database = require('better-sqlite3');
const db = new Database('auction.db');

const payload = {
    id: 'seller-1',
    firstName: 'أحمد',
    lastName: 'البائع',
    phone: '123456',
    address: 'الفرناج 2',
    companyName: 'المزاد التجريبي الجديد'
};

const userToUpdate = db.prepare("SELECT * FROM users WHERE id = ?").get(payload.id);
console.log("1. BEFORE UPDATE:", userToUpdate);

const newFirstName = payload.firstName !== undefined ? payload.firstName : userToUpdate.firstName;
const newLastName = payload.lastName !== undefined ? payload.lastName : userToUpdate.lastName;
const newPhone = payload.phone !== undefined ? payload.phone : userToUpdate.phone;
const newAddress1 = payload.address !== undefined ? payload.address : userToUpdate.address1;
const newCompanyName = payload.companyName !== undefined ? payload.companyName : userToUpdate.companyName;

db.prepare(`
UPDATE users 
SET firstName = ?,
    lastName = ?,
    phone = ?,
    address1 = ?,
    companyName = ?
WHERE id = ?
`).run(newFirstName, newLastName, newPhone, newAddress1, newCompanyName, payload.id);

console.log("2. AFTER UPDATE:", db.prepare("SELECT * FROM users WHERE id = ?").get(payload.id));
