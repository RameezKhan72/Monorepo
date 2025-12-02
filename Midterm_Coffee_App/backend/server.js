const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());

const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const MENU_FILE = path.join(DATA_DIR, 'menu.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

if (!fs.existsSync(MENU_FILE)) {
  fs.writeFileSync(MENU_FILE, JSON.stringify([
    { id: '1', name: 'Espresso', price: 150, description: 'Strong and bold', image: '/images/espresso.jpg' },
    { id: '2', name: 'Americano', price: 180, description: 'Espresso with hot water', image: '/images/americano.jpg' },
    { id: '3', name: 'Cappuccino', price: 250, description: 'Espresso with steamed milk and foam', image: '/images/cappuccino.jpg' }
  ], null, 2));
}
if (!fs.existsSync(ORDERS_FILE)) fs.writeFileSync(ORDERS_FILE, JSON.stringify([], null, 2));
if (!fs.existsSync(USERS_FILE)) {
  fs.writeFileSync(USERS_FILE, JSON.stringify([
    { id: 'u1', username: 'user', password: 'pass' }
  ], null, 2));
}

function readJSON(file){ return JSON.parse(fs.readFileSync(file)); }
function writeJSON(file, data){ fs.writeFileSync(file, JSON.stringify(data, null, 2)); }

// Auth (mock)
app.post('/auth/login', (req, res) => {
  const { username, password } = req.body;
  const users = readJSON(USERS_FILE);
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  return res.json({ token: 'mock-token-' + user.id, user: { id: user.id, username: user.username } });
});

// Menu
app.get('/menu', (req, res) => {
  res.json(readJSON(MENU_FILE));
});

// Place order
app.post('/order', (req, res) => {
  const { userId, items, total, paymentMethod } = req.body;
  if (!items || !Array.isArray(items) || items.length === 0) return res.status(400).json({ error: 'No items' });
  const orders = readJSON(ORDERS_FILE);
  const order = { id: uuidv4(), userId: userId || null, items, total, paymentMethod: paymentMethod || 'cash', status: 'placed', createdAt: new Date().toISOString() };
  orders.push(order);
  writeJSON(ORDERS_FILE, orders);
  res.status(201).json(order);
});

// Mock payment endpoint
app.post('/payment', (req, res) => {
  const { orderId, method, details } = req.body;
  return res.json({ success: true, transactionId: 'txn_' + uuidv4() });
});

app.use('/images', express.static(path.join(__dirname, 'images')));

app.listen(PORT, () => {
  console.log('Backend running on http://localhost:' + PORT);
});
