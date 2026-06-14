const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ===== IN-MEMORY DATABASE =====
const products = [
    { id: 1, name: "Shea Butter Cream", price: 8000, category: "skincare", emoji: "🧴" },
    { id: 2, name: "Coconut Hair Oil", price: 6500, category: "haircare", emoji: "🥥" },
    { id: 3, name: "Avocado Face Mask", price: 5000, category: "skincare", emoji: "🥑" },
    { id: 4, name: "Honey Lip Balm", price: 3000, category: "bodycare", emoji: "🍯" },
    { id: 5, name: "Aloe Vera Gel", price: 4500, category: "skincare", emoji: "🌿" },
    { id: 6, name: "Black Soap Bar", price: 3500, category: "bodycare", emoji: "🧼" },
    { id: 7, name: "Herbal Hair Mask", price: 7000, category: "haircare", emoji: "🌱" },
    { id: 8, name: "Body Butter Lotion", price: 9000, category: "bodycare", emoji: "🧈" }
];

const customers = [];
const orders = [];
let orderId = 1;

// ===== API ROUTES =====
app.get("/api/products", (req, res) => {
    res.json(products);
});

app.post("/api/orders", (req, res) => {
    const { name, email, phone, address, cart, total } = req.body;
    const customer = { id: customers.length + 1, name, email, phone, address };
    customers.push(customer);
    const order = { id: orderId++, customerId: customer.id, total, items: cart, createdAt: new Date() };
    orders.push(order);
    res.json({ success: true, orderId: order.id });
});

app.get("/api/orders", (req, res) => {
    res.json(orders);
});

app.listen(PORT, () => {
    console.log(`KigaliGlow server running on http://localhost:${PORT}`);
});