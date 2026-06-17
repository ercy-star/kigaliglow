const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ===== IN-MEMORY DATABASE =====
let products = [
    { id: 1, name: "Shea Butter Cream", price: 8000, category: "skincare", emoji: "🧴", sellerId: null, sellerName: "KigaliGlow" },
    { id: 2, name: "Coconut Hair Oil", price: 6500, category: "haircare", emoji: "🥥", sellerId: null, sellerName: "KigaliGlow" },
    { id: 3, name: "Avocado Face Mask", price: 5000, category: "skincare", emoji: "🥑", sellerId: null, sellerName: "KigaliGlow" },
    { id: 4, name: "Honey Lip Balm", price: 3000, category: "bodycare", emoji: "🍯", sellerId: null, sellerName: "KigaliGlow" },
    { id: 5, name: "Aloe Vera Gel", price: 4500, category: "skincare", emoji: "🌿", sellerId: null, sellerName: "KigaliGlow" },
    { id: 6, name: "Black Soap Bar", price: 3500, category: "bodycare", emoji: "🧼", sellerId: null, sellerName: "KigaliGlow" },
    { id: 7, name: "Herbal Hair Mask", price: 7000, category: "haircare", emoji: "🌱", sellerId: null, sellerName: "KigaliGlow" },
    { id: 8, name: "Body Butter Lotion", price: 9000, category: "bodycare", emoji: "🧈", sellerId: null, sellerName: "KigaliGlow" }
];

const customers = [];
const orders = [];
const sellers = [];

let productIdCounter = 9;
let orderIdCounter = 1;
let sellerIdCounter = 1;

const COMMISSION_RATE = 0.10; // KigaliGlow takes 10%

// ===== PRODUCT ROUTES =====
app.get("/api/products", (req, res) => {
    res.json(products);
});

// ===== ORDER ROUTES =====
app.post("/api/orders", (req, res) => {
    const { name, email, phone, address, cart, total } = req.body;

    const customer = { id: customers.length + 1, name, email, phone, address };
    customers.push(customer);

    // Calculate commission per item based on which seller it belongs to
    const itemsWithCommission = cart.map(item => {
        const product = products.find(p => p.id === item.id);
        const itemTotal = item.price * item.quantity;
        const commission = Math.round(itemTotal * COMMISSION_RATE);
        return {
            ...item,
            sellerId: product ? product.sellerId : null,
            itemTotal,
            commission,
            sellerEarning: itemTotal - commission
        };
    });

    const order = {
        id: orderIdCounter++,
        customerId: customer.id,
        total,
        items: itemsWithCommission,
        createdAt: new Date()
    };
    orders.push(order);

    res.json({ success: true, orderId: order.id });
});

app.get("/api/orders", (req, res) => {
    res.json(orders);
});

// ===== SELLER ROUTES =====

// Register a new seller
app.post("/api/sellers", (req, res) => {
    const { name, shopName, email, phone } = req.body;

    if (!name || !shopName || !email || !phone) {
        return res.status(400).json({ error: "All fields are required" });
    }

    const seller = { id: sellerIdCounter++, name, shopName, email, phone, createdAt: new Date() };
    sellers.push(seller);

    res.json({ success: true, sellerId: seller.id, shopName: seller.shopName });
});

// Get all sellers (for admin/demo purposes)
app.get("/api/sellers", (req, res) => {
    res.json(sellers);
});

// Seller adds a new product
app.post("/api/sellers/products", (req, res) => {
    const { sellerId, name, price, category, emoji } = req.body;

    const seller = sellers.find(s => s.id === parseInt(sellerId));
    if (!seller) {
        return res.status(404).json({ error: "Seller not found" });
    }

    const newProduct = {
        id: productIdCounter++,
        name,
        price: parseInt(price),
        category,
        emoji,
        sellerId: seller.id,
        sellerName: seller.shopName
    };
    products.push(newProduct);

    res.json({ success: true, product: newProduct });
});

// Get products belonging to a specific seller
app.get("/api/sellers/:id/products", (req, res) => {
    const sellerId = parseInt(req.params.id);
    const sellerProducts = products.filter(p => p.sellerId === sellerId);
    res.json(sellerProducts);
});

// Get a seller's earnings (90% of their sales, KigaliGlow keeps 10%)
app.get("/api/sellers/:id/earnings", (req, res) => {
    const sellerId = parseInt(req.params.id);
    let totalSales = 0;
    let commission = 0;

    orders.forEach(order => {
        order.items.forEach(item => {
            if (item.sellerId === sellerId) {
                totalSales += item.itemTotal;
                commission += item.commission;
            }
        });
    });

    res.json({
        totalSales,
        commission,
        sellerEarnings: totalSales - commission
    });
});

// ===== START SERVER =====
app.listen(PORT, () => {
    console.log(`KigaliGlow server running on http://localhost:${PORT}`);
});