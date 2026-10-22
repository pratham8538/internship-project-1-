const express = require('express');
const db = require('../db');
const { auth } = require('../middleware');
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

// Reviews endpoints
router.get('/pizzas/:id/reviews', (req, res) => {
  const pizzaId = req.params.id;
  const reviews = db.prepare('SELECT * FROM reviews WHERE pizza_id = ? ORDER BY id DESC').all(pizzaId);
  const totalReviews = reviews.length;
  const avg = totalReviews ? +(reviews.reduce((s, r) => s + r.rating, 0) / totalReviews).toFixed(1) : 0;
  
  const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach((r) => {
    if (breakdown[r.rating] !== undefined) breakdown[r.rating]++;
  });

  res.json({
    reviews,
    totalReviews,
    averageRating: avg,
    breakdown,
  });
});

router.post('/pizzas/:id/reviews', auth, (req, res) => {
  const pizzaId = parseInt(req.params.id, 10);
  const { rating, comment } = req.body;

  const pizza = db.prepare('SELECT id FROM pizzas WHERE id = ?').get(pizzaId);
  if (!pizza) return res.status(404).json({ error: 'Pizza not found' });

  const numRating = parseInt(rating, 10);
  if (isNaN(numRating) || numRating < 1 || numRating > 5) {
    return res.status(400).json({ error: 'Rating must be an integer between 1 and 5' });
  }

  const cleanComment = (comment || '').trim();
  if (cleanComment.length < 3) {
    return res.status(400).json({ error: 'Please enter a review comment of at least 3 characters' });
  }

  const user = db.prepare('SELECT name FROM users WHERE id = ?').get(req.user.id);
  const userName = user?.name || req.user.name || 'Pizzania Foodie';

  const insert = db.prepare(`
    INSERT INTO reviews (pizza_id, user_id, user_name, rating, comment, created_at)
    VALUES (?, ?, ?, ?, ?, datetime('now', '+05:30'))
  `).run(pizzaId, req.user.id, userName, numRating, cleanComment);

  // Recalculate average rating on pizza
  const avgRow = db.prepare('SELECT ROUND(AVG(rating), 1) as avgRating FROM reviews WHERE pizza_id = ?').get(pizzaId);
  if (avgRow && avgRow.avgRating) {
    db.prepare('UPDATE pizzas SET rating = ? WHERE id = ?').run(avgRow.avgRating, pizzaId);
  }

  const createdReview = db.prepare('SELECT * FROM reviews WHERE id = ?').get(insert.lastInsertRowid);
  res.status(201).json({
    ok: true,
    review: createdReview,
    newAverage: avgRow?.avgRating || numRating,
  });
});

// Favorites endpoints
router.get('/favorites', auth, (req, res) => {
  const favorites = db.prepare(`
    SELECT p.* FROM pizzas p
    JOIN favorites f ON f.pizza_id = p.id
    WHERE f.user_id = ? AND p.is_active = 1
    ORDER BY f.id DESC
  `).all(req.user.id);
  res.json({ favorites });
});

router.get('/favorites/ids', auth, (req, res) => {
  const rows = db.prepare('SELECT pizza_id FROM favorites WHERE user_id = ?').all(req.user.id);
  res.json({ favoriteIds: rows.map((r) => r.pizza_id) });
});

router.post('/favorites/:pizzaId', auth, (req, res) => {
  const pizzaId = parseInt(req.params.pizzaId, 10);
  const existing = db.prepare('SELECT id FROM favorites WHERE user_id = ? AND pizza_id = ?').get(req.user.id, pizzaId);
  
  let favorited = false;
  if (existing) {
    db.prepare('DELETE FROM favorites WHERE id = ?').run(existing.id);
    favorited = false;
  } else {
    db.prepare('INSERT INTO favorites (user_id, pizza_id, created_at) VALUES (?, ?, datetime(\'now\', \'+05:30\'))').run(req.user.id, pizzaId);
    favorited = true;
  }

  const count = db.prepare('SELECT COUNT(*) as c FROM favorites WHERE user_id = ?').get(req.user.id).c;
  res.json({ favorited, count });
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
