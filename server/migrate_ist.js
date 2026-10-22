const Database = require('better-sqlite3');
const path = require('path');
const db = new Database(path.join(__dirname, 'pizzania.db'));

try {
  const usersUpdated = db.prepare("UPDATE users SET created_at = datetime(created_at, '+05:30') WHERE created_at NOT LIKE '%T%' AND datetime(created_at, '+05:30') IS NOT NULL").run();
  console.log('Updated users:', usersUpdated.changes);

  const ordersUpdated = db.prepare("UPDATE orders SET created_at = datetime(created_at, '+05:30') WHERE created_at NOT LIKE '%T%' AND datetime(created_at, '+05:30') IS NOT NULL").run();
  console.log('Updated orders:', ordersUpdated.changes);

  const staffUpdated = db.prepare("UPDATE staff_members SET created_at = datetime(created_at, '+05:30') WHERE created_at NOT LIKE '%T%' AND datetime(created_at, '+05:30') IS NOT NULL").run();
  console.log('Updated staff:', staffUpdated.changes);

  console.log('Successfully migrated timestamps to IST (+05:30)');
} catch (e) {
  console.error('Error during migration:', e);
}
