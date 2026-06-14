const express = require("express");
const Database = require("better-sqlite3");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// ===== MIDDLEWARE =====
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ===== DATABASE SETUP =====
const db = new Database("kigaliglow.db");

// Create tables if they don't exist
db.exec(`
    CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        price INTEGER NOT NULL,
        category TEXT NOT NULL,
        emoji TEXT
    );

    CREATE TABLE IF NOT EXISTS customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        address TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_id INTEGER,
        total INTEGER NOT NULL,
        items TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES customers(id)
    );
`);

// Seed products if empty
const productCount = db.prepare("SELECT COUNT(*) as count FROM products").get();
if (productCount.count === 0) {
    const insert = db.prepare("INSERT INTO products (name, price, category, emoji) VALUES (?, ?, ?, ?)");
    insert.run("Shea Butter Cream", 8000, "skincare", "🧴");
    insert.run("Coconut Hair Oil", 6500, "haircare", "🥥");
    insert.run("Avocado Face Mask", 5000, "skincare", "🥑");
    insert.run("Honey Lip Balm", 3000, "bodycare", "🍯");
    insert.run("Aloe Vera Gel", 4500, "skincare", "🌿");
    insert.run("Black Soap Bar", 3500, "bodycare", "🧼");
    insert.run("Herbal Hair Mask", 7000, "haircare", "🌱");
    insert.run("Body Butter Lotion", 9000, "bodycare", "🧈");
    console.log("Products seeded!");
}

// ===== API ROUTES =====

// GET all products
app.get("/api/products", (req, res) => {
    const products = db.prepare("SELECT * FROM products").all();
    res.json(products);
});

// POST new order
app.post("/api/orders", (req, res) => {
    const { name, email, phone, address, cart, total } = req.body;

    const customerStmt = db.prepare(
        "INSERT INTO customers (name, email, phone, address) VALUES (?, ?, ?, ?)"
    );
    const customer = customerStmt.run(name, email, phone, address);

    const orderStmt = db.prepare(
        "INSERT INTO orders (customer_id, total, items) VALUES (?, ?, ?)"
    );
    const order = orderStmt.run(customer.lastInsertRowid, total, JSON.stringify(cart));

    res.json({ 
        success: true, 
        orderId: order.lastInsertRowid,
        message: "Order placed successfully!" 
    });
});

// GET all orders
app.get("/api/orders", (req, res) => {
    const orders = db.prepare("SELECT * FROM orders").all();
    res.json(orders);
});

// ===== START SERVER =====
app.listen(PORT, () => {
    console.log(`KigaliGlow server running on http://localhost:${PORT}`);
});