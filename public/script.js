// ===== PRODUCT DATA =====
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

// ===== CART (stored in browser's localStorage) =====
function getCart() {
    return JSON.parse(localStorage.getItem("cart")) || [];
}

function saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartCount();
}

function updateCartCount() {
    const cart = getCart();
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountEl = document.getElementById("cart-count");
    if (cartCountEl) cartCountEl.textContent = count;
}

function addToCart(productId) {
    const cart = getCart();
    const existing = cart.find(item => item.id === productId);

    if (existing) {
        existing.quantity += 1;
    } else {
        const product = products.find(p => p.id === productId);
        cart.push({ id: product.id, name: product.name, price: product.price, emoji: product.emoji, quantity: 1 });
    }

    saveCart(cart);
    alert("Added to cart!");
}

// ===== DISPLAY PRODUCTS (on products.html) =====
function displayProducts(category = "all") {
    const grid = document.getElementById("products-grid");
    if (!grid) return; // Not on products page

    const filtered = category === "all" ? products : products.filter(p => p.category === category);

    grid.innerHTML = filtered.map(p => `
        <div class="product-card">
            <div class="product-image">${p.emoji}</div>
            <div class="product-info">
                <h3>${p.name}</h3>
                <p class="product-price">${p.price.toLocaleString()} RWF</p>
                <button class="btn" onclick="addToCart(${p.id})">Add to Cart</button>
            </div>
        </div>
    `).join("");
}

// ===== CATEGORY FILTER BUTTONS =====
function setupCategoryFilters() {
    const buttons = document.querySelectorAll(".cat-btn");
    buttons.forEach(btn => {
        btn.addEventListener("click", () => {
            buttons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            displayProducts(btn.dataset.category);
        });
    });
}

// ===== INITIALIZE ON PAGE LOAD =====
document.addEventListener("DOMContentLoaded", () => {
    updateCartCount();
    displayProducts();
    setupCategoryFilters();
});