# 🍕 Pizzania - Full-Stack Pizza Ordering Platform

![Pizzania Banner](https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=1200&h=400&fit=crop)

A complete, dynamic, and fully-featured full-stack pizza ordering web application. Pizzania provides a seamless experience for customers to browse, customize, and order their favorite pizzas, while offering a powerful administrative dashboard for restaurant owners to manage operations.

## ✨ Features

### 🧑‍🍳 For Customers
* **Interactive Menu:** Browse pizzas by category, view detailed descriptions, and filter by search.
* **Custom Pizza Builder:** Build your own pizza from scratch by selecting crusts, sauces, and toppings.
* **Smart Cart & Checkout:** Real-time cart calculation including taxes, delivery fees, and dynamic free delivery thresholds. Multiple payment options (Cash on Delivery, Digital).
* **Live Order Tracking:** Watch your order status change in real-time (Placed → Preparing → Out for Delivery → Delivered).
* **User Profiles:** Secure authentication (JWT), order history, and account management.

### 💼 For Administrators (Dashboard)
* **Real-time Analytics & Reports:** Track revenue, active kitchen load, hourly sales, and top-selling items.
* **Order Management:** Update order statuses seamlessly and process incoming requests.
* **Inventory Control:** Full CRUD operations for menu items (pizzas & toppings) and automated low-stock alerts.
* **Dynamic Settings Control:** Change store operating hours, adjust delivery fees and tax rates, toggle payment methods, and close/open the store instantly with immediate effect on the storefront.
* **Staff & Customer Management:** View registered customers and manage staff access.

## 🛠️ Technology Stack

* **Frontend:** React (Vite), Tailwind CSS (Vanilla CSS for flexible styling)
* **Backend:** Node.js, Express REST API
* **Database:** SQLite (`better-sqlite3`) — Zero setup, file-based, persists automatically.
* **Authentication:** JSON Web Tokens (JWT) & bcrypt.

## 🚀 Getting Started

You'll need Node.js 18+ installed on your local machine.

### 1. Clone & Install Dependencies
First, install dependencies for both the frontend and backend:

```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 2. Environment Setup
The project uses `.env` files for configuration. Example files are provided.

**Backend (`server/.env`):**
```env
PORT=4000
JWT_SECRET=your_secure_jwt_secret
CLIENT_URL=http://localhost:5173
```

**Frontend (`client/.env`):**
```env
VITE_API_URL=/api
VITE_API_PROXY_TARGET=http://localhost:4000
```

### 3. Run the Development Servers
You can run both servers from the project root:

```bash
npm run dev:server  # Starts the Node API on port 4000
npm run dev:client  # Starts the React Vite server on port 5173
```
Open `http://localhost:5173` in your browser. The API auto-creates `pizzania.db` with seed data on the first run.

## 📦 Production Deployment

Pizzania is configured to allow Express to serve the built React application and the SQLite database from a single deployment.

1. Build the React frontend:
```bash
cd client
npm run build
```
2. Start the Express server:
```bash
cd ../server
npm start
```
*Note: In production, ensure the `server/pizzania.db` file is stored on a persistent volume.*

## 🔑 Default Accounts

On first run, the database is seeded with a default administrator account:
* **Email:** `admin@pizzania.com`
* **Password:** `admin123`

You can register a standard customer account at `/register`.

## 📄 License
This project is open-source and available under the MIT License.
