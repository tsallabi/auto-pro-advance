import Database from 'better-sqlite3';
const db = new Database('auction.db');

try {
  db.prepare(`
    INSERT OR REPLACE INTO users(id, firstName, lastName, email, role, status, joinDate)
    VALUES('user-marketing-test', 'Tareq', 'Tsallabi', 'tsallabi@yahoo.ca', 'buyer', 'active', datetime('now'))
  `).run();
  console.log('✅ Test user tsallabi@yahoo.ca added successfully');
} catch (e) {
  console.error('Error adding user:', e.message);
}
