const express = require('express');
const db = require('../db');
const { auth } = require('../middleware');
const router = express.Router();

const STAGES = ['Placed', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered'];

router.post('/', auth, (req, res) => {
  const { items, address, payment_method, payment_details } = req.body;
  if (!items || !items.length) return res.status(400).json({ error: 'Cart is empty' });

  // Check store open/closed
  const isOpenRow = db.prepare("SELECT value FROM settings WHERE key = 'is_open'").get();
  if (isOpenRow?.value === 'false') {
    return res.status(503).json({ error: 'Sorry, the store is currently closed. Please check back later.' });
  }

  const deliveryFeeRow = db.prepare("SELECT value FROM settings WHERE key = 'delivery_fee'").get();
  const taxRow = db.prepare("SELECT value FROM settings WHERE key = 'tax_rate'").get();
  const deliveryFee = parseFloat(deliveryFeeRow?.value || 3.99);
  const taxRate = parseFloat(taxRow?.value || 8) / 100;

  const subtotal = items.reduce((sum, it) => sum + it.price * it.qty, 0);
  const tax = subtotal * taxRate;
  const total = +(subtotal + tax + deliveryFee).toFixed(2);
  const orderNumber = 'PZ-' + Math.random().toString(36).substring(2, 8).toUpperCase();

  const orderInfo = db.prepare('INSERT INTO orders (user_id, status, total, address, payment_method, payment_details, order_number) VALUES (?,?,?,?,?,?,?)')
    .run(req.user.id, 'Placed', total, address || '', payment_method || 'Card', JSON.stringify(payment_details || {}), orderNumber);

  const insertItem = db.prepare('INSERT INTO order_items (order_id, name, qty, price, customization) VALUES (?,?,?,?,?)');
  const tx = db.transaction((rows) => rows.forEach(it => insertItem.run(orderInfo.lastInsertRowid, it.name, it.qty, it.price, JSON.stringify(it.customization || null))));
  tx(items);

  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderInfo.lastInsertRowid);
  const orderItems = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
  res.json({ order: { ...order, items: orderItems, subtotal, tax, deliveryFee } });
});

router.get('/my', auth, (req, res) => {
  const orders = db.prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY id DESC').all(req.user.id);
  const withItems = orders.map(o => ({ ...o, items: db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(o.id) }));
  res.json({ orders: withItems });
});

router.get('/:id', auth, (req, res) => {
  const order = db.prepare('SELECT * FROM orders WHERE id = ? OR order_number = ?').get(req.params.id, req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  if (order.user_id !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ error: 'Not authorized to view this order' });
  const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
  const stageIndex = STAGES.indexOf(order.status);
  res.json({ order: { ...order, items, stages: STAGES, stageIndex } });
});

module.exports = router;
