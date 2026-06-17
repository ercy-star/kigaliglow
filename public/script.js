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

let allProducts = []; // cache of products fetched from server

function addToCart(productId) {
    const cart = getCart();
    const existing = cart.find(item => item.id === productId);

    if (existing) {
        existing.quantity += 1;
    } else {
        const product = allProducts.find(p => p.id === productId);
        if (!product) return;
        cart.push({ id: product.id, name: product.name, price: product.price, emoji: product.emoji, quantity: 1 });
    }

    saveCart(cart);
    alert("Added to cart!");
}

// ===== DISPLAY PRODUCTS (on products.html) =====
function displayProducts(category = "all") {
    const grid = document.getElementById("products-grid");
    if (!grid) return; // Not on products page

    const filtered = category === "all" ? allProducts : allProducts.filter(p => p.category === category);

    grid.innerHTML = filtered.map(p => `
        <div class="product-card">
            <div class="product-image">${p.emoji}</div>
            <div class="product-info">
                <h3>${p.name}</h3>
                ${p.sellerName && p.sellerName !== "KigaliGlow" ? `<p style="font-size:0.8rem;color:#777;">Sold by ${p.sellerName}</p>` : ""}
                <p class="product-price">${p.price.toLocaleString()} RWF</p>
                <button class="btn" onclick="addToCart(${p.id})">Add to Cart</button>
            </div>
        </div>
    `).join("");
}

function loadProductsAndDisplay() {
    fetch("/api/products")
        .then(res => res.json())
        .then(data => {
            allProducts = data;
            displayProducts();
        })
        .catch(err => console.error("Failed to load products:", err));
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

// ===== NAVBAR SELLER STATE (login display + logout) =====
function updateNavbarForSeller() {
    const sellerId = localStorage.getItem("sellerId");
    const sellerShopName = localStorage.getItem("sellerShopName");
    const sellLink = document.querySelector('a[href="seller-register.html"]');

    if (sellerId && sellLink) {
        sellLink.textContent = sellerShopName ? `${sellerShopName} (Dashboard)` : "My Dashboard";
        sellLink.href = "seller-dashboard.html";

        // Add a logout link right after the dashboard link
        if (!document.getElementById("seller-logout-link")) {
            const logoutLink = document.createElement("a");
            logoutLink.id = "seller-logout-link";
            logoutLink.href = "#";
            logoutLink.textContent = "Logout";
            logoutLink.style.marginLeft = "1rem";
            logoutLink.addEventListener("click", function (e) {
                e.preventDefault();
                localStorage.removeItem("sellerId");
                localStorage.removeItem("sellerShopName");
                window.location.href = "index.html";
            });
            sellLink.insertAdjacentElement("afterend", logoutLink);
        }
    }
}

// ===== INITIALIZE ON PAGE LOAD =====
document.addEventListener("DOMContentLoaded", () => {
    updateCartCount();
    updateNavbarForSeller();
    if (document.getElementById("products-grid")) {
        loadProductsAndDisplay();
    }
    setupCategoryFilters();
});