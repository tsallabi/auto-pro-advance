const Database = require('better-sqlite3');
const db = new Database('auction.db');

try {
  // Update all templates in the database
  const templates = db.prepare("SELECT id, subject, body_html, body_whatsapp FROM notification_templates").all();
  
  const updateStmt = db.prepare("UPDATE notification_templates SET subject = ?, body_html = ?, body_whatsapp = ?, updatedAt = ? WHERE id = ?");
  
  let count = 0;
  for (const t of templates) {
    const newSubject = t.subject.replace(/lyautopro\.com/g, 'www.autopro.ac');
    const newHtml = t.body_html.replace(/lyautopro\.com/g, 'www.autopro.ac');
    const newWhatsapp = t.body_whatsapp.replace(/lyautopro\.com/g, 'www.autopro.ac');
    
    if (newSubject !== t.subject || newHtml !== t.body_html || newWhatsapp !== t.body_whatsapp) {
      updateStmt.run(newSubject, newHtml, newWhatsapp, new Date().toISOString(), t.id);
      count++;
    }
  }
  
  console.log(`Successfully updated ${count} templates in the database to use www.autopro.ac`);
} catch (e) {
  console.error("Migration failed:", e.message);
} finally {
  db.close();
}
