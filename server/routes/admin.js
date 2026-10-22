const express = require('express');
const db = require('../db');
const { auth, adminOnly } = require('../middleware');
const router = express.Router();

router.use(auth, adminOnly);

// Dashboard stats
router.get('/stats', (req, res) => {
  const totalOrders = db.prepare('SELECT COUNT(*) as c FROM orders').get().c;
  const revenue = db.prepare('SELECT COALESCE(SUM(total),0) as s FROM orders').get().s;
  const totalCustomers = db.prepare("SELECT COUNT(*) as c FROM users WHERE role = 'customer'").get().c;
  const pendingOrders = db.prepare("SELECT COUNT(*) as c FROM orders WHERE status != 'Delivered'").get().c;
  const recentOrders = db.prepare('SELECT o.*, u.name as customer_name FROM orders o LEFT JOIN users u ON u.id = o.user_id ORDER BY o.id DESC LIMIT 8').all();
  const topPizzas = db.prepare(`SELECT name, SUM(qty) as sold FROM order_items GROUP BY name ORDER BY sold DESC LIMIT 5`).all();
  const lowStock = db.prepare('SELECT name, stock FROM pizzas WHERE stock < 20 ORDER BY stock ASC').all();
  res.json({ totalOrders, revenue, totalCustomers, pendingOrders, recentOrders, topPizzas, lowStock });
});

router.get('/reports', (req, res) => {
  const totalOrders = db.prepare('SELECT COUNT(*) as c FROM orders').get().c;
  const revenue = db.prepare('SELECT COALESCE(SUM(total),0) as s FROM orders').get().s;
  const avgOrderValue = totalOrders ? +(revenue / totalOrders).toFixed(2) : 0;
  const activeKitchen = db.prepare("SELECT COUNT(*) as c FROM orders WHERE status IN ('Placed', 'Confirmed', 'Preparing')").get().c;
  const statusBreakdown = db.prepare('SELECT status, COUNT(*) as count FROM orders GROUP BY status ORDER BY count DESC').all();
  const hourlySales = db.prepare(`
    SELECT strftime('%H', created_at) as hour, ROUND(COALESCE(SUM(total), 0), 2) as total
    FROM orders
    WHERE date(created_at) = date('now', '+05:30')
    GROUP BY strftime('%H', created_at)
    ORDER BY hour
  `).all();
  const topPizzas = db.prepare(`
    SELECT name, SUM(qty) as sold, ROUND(SUM(qty * price), 2) as revenue
    FROM order_items
    GROUP BY name
    ORDER BY sold DESC
    LIMIT 6
  `).all();
  const recentOrders = db.prepare(`
    SELECT o.*, u.name as customer_name, u.email as customer_email
    FROM orders o
    LEFT JOIN users u ON u.id = o.user_id
    ORDER BY o.id DESC
    LIMIT 10
  `).all().map((order) => ({
    ...order,
    items: db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id),
  }));

  res.json({ totalOrders, revenue, avgOrderValue, activeKitchen, statusBreakdown, hourlySales, topPizzas, recentOrders });
});

// Pizzas / inventory CRUD
router.get('/pizzas', (req, res) => {
  res.json({ pizzas: db.prepare('SELECT * FROM pizzas ORDER BY id DESC').all() });
});

router.post('/pizzas', (req, res) => {
  const { name, description, price, category, image, stock } = req.body;
  if (!name || !price) return res.status(400).json({ error: 'Name and price are required' });
  const info = db.prepare('INSERT INTO pizzas (name, description, price, category, image, stock) VALUES (?,?,?,?,?,?)')
    .run(name, description || '', price, category || 'Classic', image || '', stock ?? 50);
  res.json({ pizza: db.prepare('SELECT * FROM pizzas WHERE id = ?').get(info.lastInsertRowid) });
});

router.put('/pizzas/:id', (req, res) => {
  const { name, description, price, category, image, stock, is_active } = req.body;
  db.prepare(`UPDATE pizzas SET name=COALESCE(?,name), description=COALESCE(?,description), price=COALESCE(?,price),
    category=COALESCE(?,category), image=COALESCE(?,image), stock=COALESCE(?,stock), is_active=COALESCE(?,is_active) WHERE id=?`)
    .run(name, description, price, category, image, stock, is_active, req.params.id);
  res.json({ pizza: db.prepare('SELECT * FROM pizzas WHERE id = ?').get(req.params.id) });
});

router.delete('/pizzas/:id', (req, res) => {
  db.prepare('DELETE FROM pizzas WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// Orders management
router.get('/orders', (req, res) => {
  const { status } = req.query;
  let q = 'SELECT o.*, u.name as customer_name, u.email as customer_email FROM orders o LEFT JOIN users u ON u.id = o.user_id';
  const params = [];
  if (status && status !== 'All') { q += ' WHERE o.status = ?'; params.push(status); }
  q += ' ORDER BY o.id DESC';
  const orders = db.prepare(q).all(...params);
  const withItems = orders.map(o => ({ ...o, items: db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(o.id) }));
  res.json({ orders: withItems });
});

router.put('/orders/:id/status', (req, res) => {
  const { status } = req.body;
  const valid = ['Placed', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'];
  if (!valid.includes(status)) return res.status(400).json({ error: 'Invalid status' });
  db.prepare('UPDATE orders SET status = ? WHERE id = ? OR order_number = ?').run(status, req.params.id, req.params.id);
  res.json({ order: db.prepare('SELECT * FROM orders WHERE id = ? OR order_number = ?').get(req.params.id, req.params.id) });
});

// Customers
router.get('/customers', (req, res) => {
  const customers = db.prepare(`SELECT u.id, u.name, u.email, u.phone, u.address, u.created_at,
    COUNT(o.id) as order_count, COALESCE(SUM(o.total),0) as total_spent
    FROM users u LEFT JOIN orders o ON o.user_id = u.id
    WHERE u.role = 'customer' GROUP BY u.id ORDER BY u.id DESC`).all();
  res.json({ customers });
});

router.delete('/customers/:id', (req, res) => {
  db.prepare("DELETE FROM users WHERE id = ? AND role = 'customer'").run(req.params.id);
  res.json({ success: true });
});

// Toppings inventory
router.get('/toppings', (req, res) => {
  res.json({ toppings: db.prepare('SELECT * FROM toppings ORDER BY category, name').all() });
});

router.post('/toppings', (req, res) => {
  const { name, category, price, stock } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });
  const info = db.prepare('INSERT INTO toppings (name, category, price, stock) VALUES (?,?,?,?)')
    .run(name, category || 'Topping', price || 0, stock ?? 100);
  res.json({ topping: db.prepare('SELECT * FROM toppings WHERE id = ?').get(info.lastInsertRowid) });
});

router.put('/toppings/:id', (req, res) => {
  const { name, category, price, stock } = req.body;
  db.prepare('UPDATE toppings SET name = COALESCE(?,name), category = COALESCE(?,category), stock = COALESCE(?,stock), price = COALESCE(?,price) WHERE id = ?')
    .run(name, category, stock, price, req.params.id);
  res.json({ topping: db.prepare('SELECT * FROM toppings WHERE id = ?').get(req.params.id) });
});

router.delete('/toppings/:id', (req, res) => {
  db.prepare('DELETE FROM toppings WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// Settings
router.get('/settings', (req, res) => {
  const rows = db.prepare('SELECT * FROM settings').all();
  const settings = {};
  rows.forEach(r => settings[r.key] = r.value);
  res.json({ settings });
});

router.put('/settings', (req, res) => {
  try {
    const upsert = db.prepare('INSERT INTO settings (key, value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value = excluded.value');
    const updateTransaction = db.transaction((entries) => {
      for (const [k, v] of entries) {
        upsert.run(k, String(v));
      }
    });
    updateTransaction(Object.entries(req.body || {}));
    
    const rows = db.prepare('SELECT * FROM settings').all();
    const settings = {};
    rows.forEach(r => settings[r.key] = r.value);
    res.json({ settings });
  } catch (err) {
    console.error('Error updating settings:', err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/staff', (req, res) => {
  const staff = db.prepare('SELECT * FROM staff_members ORDER BY id DESC').all();
  res.json({ staff });
});

router.post('/staff', (req, res) => {
  const { name, email, role, phone, avatar, status } = req.body;
  if (!name || !email || !role) return res.status(400).json({ error: 'Name, email and role are required' });
  const info = db.prepare(`INSERT INTO staff_members (name, email, role, phone, avatar, status, created_at) VALUES (?,?,?,?,?,?,datetime('now', '+05:30'))`)
    .run(name, email, role, phone || '', avatar || '', status || 'active');
  res.json({ staffMember: db.prepare('SELECT * FROM staff_members WHERE id = ?').get(info.lastInsertRowid) });
});

router.put('/staff/:id', (req, res) => {
  const { name, email, role, phone, avatar, status } = req.body;
  db.prepare(`
    UPDATE staff_members
    SET name = COALESCE(?, name),
        email = COALESCE(?, email),
        role = COALESCE(?, role),
        phone = COALESCE(?, phone),
        avatar = COALESCE(?, avatar),
        status = COALESCE(?, status)
    WHERE id = ?
  `).run(name, email, role, phone, avatar, status, req.params.id);
  res.json({ staffMember: db.prepare('SELECT * FROM staff_members WHERE id = ?').get(req.params.id) });
});

router.delete('/staff/:id', (req, res) => {
  db.prepare('DELETE FROM staff_members WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
