const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const db = new Database(path.join(__dirname, 'pizzania.db'));
db.pragma('journal_mode = WAL');

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  role TEXT DEFAULT 'customer',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pizzas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  price REAL NOT NULL,
  category TEXT DEFAULT 'Classic',
  image TEXT,
  rating REAL DEFAULT 4.5,
  stock INTEGER DEFAULT 50,
  is_active INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS toppings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  category TEXT DEFAULT 'Topping',
  price REAL DEFAULT 1.0,
  stock INTEGER DEFAULT 100
);

CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  status TEXT DEFAULT 'Placed',
  total REAL NOT NULL,
  address TEXT,
  payment_method TEXT,
  payment_details TEXT,
  order_number TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER,
  name TEXT,
  qty INTEGER,
  price REAL,
  customization TEXT,
  FOREIGN KEY(order_id) REFERENCES orders(id)
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT
);

CREATE TABLE IF NOT EXISTS staff_members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL,
  phone TEXT,
  avatar TEXT,
  status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
`);

try {
  db.prepare('ALTER TABLE orders ADD COLUMN payment_details TEXT').run();
} catch (e) {}

try {
  db.prepare('ALTER TABLE orders ADD COLUMN order_number TEXT').run();
  db.prepare("UPDATE orders SET order_number = 'PZ-' || substr('0000' || id, -4, 4) WHERE order_number IS NULL").run();
} catch (e) {}

// Seed pizzas if empty
const pizzaCount = db.prepare('SELECT COUNT(*) as c FROM pizzas').get().c;
if (pizzaCount === 0) {
  const insert = db.prepare(`INSERT INTO pizzas (name, description, price, category, image, rating, stock) VALUES (?,?,?,?,?,?,?)`);
  const seed = [
    ['Margherita Classic', 'Fresh mozzarella, San Marzano tomatoes, basil, extra virgin olive oil', 12.99, 'Classic', 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=600', 4.8, 60],
    ['Pepperoni Supreme', 'Double pepperoni, mozzarella, oregano, signature tomato sauce', 14.99, 'Classic', 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600', 4.9, 55],
    ['Quattro Formaggi', 'Mozzarella, gorgonzola, parmesan, fontina cheese blend', 15.99, 'Specialty', 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=600', 4.7, 40],
    ['BBQ Chicken Ranch', 'Grilled chicken, BBQ sauce, red onion, ranch drizzle', 16.49, 'Specialty', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600', 4.6, 45],
    ['Veggie Garden', 'Bell peppers, mushrooms, olives, onion, sweet corn, mozzarella', 13.49, 'Vegetarian', 'https://images.unsplash.com/photo-1511689660979-10d2b1aada49?w=600', 4.5, 50],
    ['Truffle Mushroom', 'Wild mushrooms, truffle oil, mozzarella, fresh thyme', 18.99, 'Premium', 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=600', 4.9, 25],
    ['Hawaiian Deluxe', 'Ham, pineapple, mozzarella, signature tomato sauce', 13.99, 'Classic', 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=600', 4.3, 35],
    ['Meat Lovers', 'Pepperoni, sausage, bacon, ham, ground beef', 17.99, 'Specialty', 'https://images.unsplash.com/photo-1620374643809-c8aaa3d61f31?w=600', 4.8, 38],
    ['Spicy Diavola', 'Spicy salami, chili flakes, mozzarella, San Marzano tomato', 15.49, 'Spicy', 'https://images.unsplash.com/photo-1593246049226-ded77bf90326?w=600', 4.6, 30],
  ];
  const tx = db.transaction((rows) => rows.forEach(r => insert.run(...r)));
  tx(seed);
}

const toppingCount = db.prepare('SELECT COUNT(*) as c FROM toppings').get().c;
if (toppingCount === 0) {
  const insert = db.prepare(`INSERT INTO toppings (name, category, price, stock) VALUES (?,?,?,?)`);
  const seed = [
    ['Thin Crust', 'Base', 0, 999], ['Classic Crust', 'Base', 0, 999], ['Stuffed Crust', 'Base', 2.5, 999],
    ['Tomato Sauce', 'Sauce', 0, 999], ['BBQ Sauce', 'Sauce', 0.5, 999], ['Pesto Sauce', 'Sauce', 1, 999],
    ['Mozzarella', 'Cheese', 1, 200], ['Cheddar', 'Cheese', 1, 150], ['Parmesan', 'Cheese', 1.5, 100],
    ['Pepperoni', 'Topping', 1.5, 150], ['Mushroom', 'Topping', 1, 120], ['Onion', 'Topping', 0.5, 130],
    ['Olives', 'Topping', 1, 100], ['Bell Pepper', 'Topping', 0.75, 110], ['Bacon', 'Topping', 1.75, 90],
  ];
  const tx = db.transaction((rows) => rows.forEach(r => insert.run(...r)));
  tx(seed);
}

// Seed default admin
const adminExists = db.prepare('SELECT * FROM users WHERE email = ?').get('admin@pizzania.com');
if (!adminExists) {
  const hash = bcrypt.hashSync('admin123', 10);
  db.prepare('INSERT INTO users (name, email, password, role) VALUES (?,?,?,?)').run('Admin User', 'admin@pizzania.com', hash, 'admin');
}

const settingsCount = db.prepare('SELECT COUNT(*) as c FROM settings').get().c;
if (settingsCount === 0) {
  const insert = db.prepare('INSERT INTO settings (key, value) VALUES (?,?)');
  insert.run('store_name', 'Pizzania');
  insert.run('delivery_fee', '3.99');
  insert.run('tax_rate', '8');
  insert.run('is_open', 'true');
  insert.run('estimated_delivery_minutes', '35');
  insert.run('support_email', 'hello@pizzania.com');
  insert.run('support_phone', '+1 (555) 019-2837');
  insert.run('store_address', '124 Baker Street, Artisanal District, Metropolis, NY 10001');
  insert.run('payment_provider', 'cash');
  insert.run('new_order_alerts', 'true');
  insert.run('inventory_warnings', 'true');
  insert.run('marketing_summaries', 'false');
  insert.run('currency_symbol', '$');
  insert.run('timezone', 'America/New_York');
  insert.run('min_order_value', '10');
  insert.run('free_delivery_above', '50');
  insert.run('low_stock_threshold', '20');
  insert.run('order_status_sms', 'false');
  insert.run('daily_sales_report', 'false');
  insert.run('max_items_per_order', '20');
  insert.run('max_active_orders', '50');
  insert.run('prep_time_buffer', '10');
  insert.run('auto_cancel_minutes', '60');
  insert.run('allow_guest_orders', 'true');
  insert.run('require_phone', 'false');
  insert.run('show_ratings', 'true');
  insert.run('show_stock_count', 'false');
  insert.run('operating_hours', JSON.stringify({
    Monday:    { open: true,  from: '10:00', to: '22:00' },
    Tuesday:   { open: true,  from: '10:00', to: '22:00' },
    Wednesday: { open: true,  from: '10:00', to: '22:00' },
    Thursday:  { open: true,  from: '10:00', to: '22:00' },
    Friday:    { open: true,  from: '10:00', to: '23:00' },
    Saturday:  { open: true,  from: '11:00', to: '23:00' },
    Sunday:    { open: false, from: '12:00', to: '20:00' },
  }));
} else {
  const defaults = {
    support_email: 'hello@pizzania.com',
    support_phone: '+1 (555) 019-2837',
    store_address: '124 Baker Street, Artisanal District, Metropolis, NY 10001',
    payment_provider: 'cash',
    new_order_alerts: 'true',
    inventory_warnings: 'true',
    marketing_summaries: 'false',
    currency_symbol: '$',
    timezone: 'America/New_York',
    min_order_value: '10',
    free_delivery_above: '50',
    low_stock_threshold: '20',
    order_status_sms: 'false',
    daily_sales_report: 'false',
    max_items_per_order: '20',
    max_active_orders: '50',
    prep_time_buffer: '10',
    auto_cancel_minutes: '60',
    allow_guest_orders: 'true',
    require_phone: 'false',
    show_ratings: 'true',
    show_stock_count: 'false',
    operating_hours: JSON.stringify({
      Monday:    { open: true,  from: '10:00', to: '22:00' },
      Tuesday:   { open: true,  from: '10:00', to: '22:00' },
      Wednesday: { open: true,  from: '10:00', to: '22:00' },
      Thursday:  { open: true,  from: '10:00', to: '22:00' },
      Friday:    { open: true,  from: '10:00', to: '23:00' },
      Saturday:  { open: true,  from: '11:00', to: '23:00' },
      Sunday:    { open: false, from: '12:00', to: '20:00' },
    }),
  };
  const upsert = db.prepare('INSERT INTO settings (key, value) VALUES (?,?) ON CONFLICT(key) DO NOTHING');
  Object.entries(defaults).forEach(([key, value]) => upsert.run(key, value));
}

const staffCount = db.prepare('SELECT COUNT(*) as c FROM staff_members').get().c;
if (staffCount === 0) {
  const insert = db.prepare('INSERT INTO staff_members (name, email, role, phone, avatar, status) VALUES (?,?,?,?,?,?)');
  const seed = [
    ['Sarah Jenkins', 'sarah@pizzania.com', 'Owner / Admin', '+1 (555) 201-9001', '', 'active'],
    ['Marco Rossi', 'marco@pizzania.com', 'Head Chef', '+1 (555) 201-9002', '', 'active'],
    ['Alex Lin', 'alex@pizzania.com', 'Delivery Coordinator', '+1 (555) 201-9003', '', 'active'],
  ];
  const tx = db.transaction((rows) => rows.forEach((row) => insert.run(...row)));
  tx(seed);
}

module.exports = db;
