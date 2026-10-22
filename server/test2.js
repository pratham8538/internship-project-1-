const Database = require('better-sqlite3');
const path = require('path');
const db = new Database(path.join(__dirname, 'pizzania.db'), { timeout: 5000 });

try {
  const upsert = db.prepare('INSERT INTO settings (key, value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value = excluded.value');
  
  const payload = {
    test_key: 'test_value'
  };
  
  Object.entries(payload).forEach(([k, v]) => upsert.run(k, String(v)));
  console.log('Success!');
} catch (e) {
  console.error('Error:', e);
}
