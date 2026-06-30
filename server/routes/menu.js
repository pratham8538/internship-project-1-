const express = require('express');
const db = require('../db');
const router = express.Router();

router.get('/pizzas', (req, res) => {
  const { category, search } = req.query;
  let q = 'SELECT * FROM pizzas WHERE is_active = 1';
  const params = [];
  if (category && category !== 'All') { q += ' AND category = ?'; params.push(category); }
  if (search) { q += ' AND (name LIKE ? OR description LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
  q += ' ORDER BY id ASC';
  const pizzas = db.prepare(q).all(...params);
  res.json({ pizzas });
});

router.get('/pizzas/:id', (req, res) => {
  const pizza = db.prepare('SELECT * FROM pizzas WHERE id = ?').get(req.params.id);
  if (!pizza) return res.status(404).json({ error: 'Pizza not found' });
  res.json({ pizza });
});

router.get('/categories', (req, res) => {
  const rows = db.prepare('SELECT DISTINCT category FROM pizzas').all();
  res.json({ categories: ['All', ...rows.map(r => r.category)] });
});

router.get('/toppings', (req, res) => {
  const toppings = db.prepare('SELECT * FROM toppings ORDER BY category, name').all();
  res.json({ toppings });
});

router.get('/store-status', (req, res) => {
  const rows = db.prepare("SELECT key, value FROM settings WHERE key IN ('is_open','estimated_delivery_minutes','store_name')").all();
  const s = {};
  rows.forEach(r => { s[r.key] = r.value; });
  res.json({
    isOpen: s.is_open !== 'false',
    estimatedMinutes: parseInt(s.estimated_delivery_minutes || 35, 10),
    storeName: s.store_name || 'Pizzania',
  });
});

module.exports = router;
