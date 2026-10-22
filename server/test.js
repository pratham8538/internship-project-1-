const db = require('./db');

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
