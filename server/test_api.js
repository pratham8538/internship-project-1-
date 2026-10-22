const jwt = require('jsonwebtoken');
const JWT_SECRET = 'pizzania_dev_secret_change_me';
const token = jwt.sign({ id: 1, email: 'admin@pizzania.com', role: 'admin' }, JWT_SECRET);

fetch('http://localhost:4000/api/admin/settings', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ test: "123" })
})
.then(res => res.json().then(data => ({ status: res.status, data })))
.then(console.log)
.catch(console.error);
