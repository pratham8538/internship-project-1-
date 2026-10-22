const db = require('better-sqlite3')('pizzania.db');
db.prepare("UPDATE orders SET created_at = datetime(created_at, '+05:30') WHERE created_at < '2026-07-01 04:00:00' AND order_number = 'PZ-6066K8'").run();
console.log('Fixed order time.');
