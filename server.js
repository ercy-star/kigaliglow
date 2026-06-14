const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// ===== MIDDLEWARE =====
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ===== DATABASE SETUP =====
const db = new sqlite3.Database("kigaliglow.db");

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        price INTEGER NOT NULL,
        category TEXT NOT NULL,
        emoji TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        address TEXT NOT NULL
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_id INTEGER,
        total INTEGER NOT NULL,
        items TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Seed products
    db.get("SELECT COUNT(*) as count FROM products", (err, row) => {
        if (row.count === 0) {
            const stmt = db.prepare("INSERT INTO products (name, price, category, emoji) VALUES (?, ?, ?, ?)");
            stmt.run("Shea Butter Cream", 8000, "skincare", "🧴");
            stmt.run("Coconut Hair Oil", 6500, "haircare", "🥥");
            stmt.run("Avocado Face Mask", 5000, "skincare", "🥑");
            stmt.run("Honey Lip Balm", 3000, "bodycare", "🍯");
            stmt.run("Aloe Vera Gel", 4500, "skincare", "🌿");
            stmt.run("Black Soap Bar", 3500, "bodycare", "🧼");
            stmt.run("Herbal Hair Mask", 7000, "haircare", "🌱");
            stmt.run("Body Butter Lotion", 9000, "bodycare", "🧈");
            stmt.finalize();
            console.log("Products seeded!");
        }
    });
});

// ===== API ROUTES =====

// GET all products
app.get("/api/products", (req, res) => {
    db.all("SELECT * FROM products", (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// POST new order
app.post("/api/orders", (req, res) => {
    const { name, email, phone, address, cart, total } = req.body;

    db.run(
        "INSERT INTO customers (name, email, phone, address) VALUES (?, ?, ?, ?)",
        [name, email, phone, address],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            const customerId = this.lastID;

            db.run(
                "INSERT INTO orders (customer_id, total, items) VALUES (?, ?, ?)",
                [customerId, total, JSON.stringify(cart)],
                function (err) {
                    if (err) return res.status(500).json({ error: err.message });
                    res.json({ success: true, orderId: this.lastID });
                }
            );
        }
    );
});

// GET all orders
app.get("/api/orders", (req, res) => {
    db.all("SELECT * FROM orders", (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// ===== START SERVER =====
app.listen(PORT, () => {
    console.log(`KigaliGlow server running on http://localhost:${PORT}`);
});