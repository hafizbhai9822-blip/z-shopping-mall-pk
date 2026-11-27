
let products = [
  {
    id: 1,
    name: "Premium Honey",
    price: 1500,
    category: "Honey",
    image: "https://images.unsplash.com/photo-1587049352851-8d4e89133924?w=500"
  },
  {
    id: 2,
    name: "Wireless Headphones",
    price: 2500,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500"
  },
  {
    id: 3,
    name: "Wrist Watch",
    price: 1800,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500"
  },
  {
    id: 4,
    name: "Travel Bag",
    price: 2200,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500"
  }
];

let cart = JSON.parse(localStorage.getItem("zmart_cart") || "[]");

function saveCart() {
  localStorage.setItem("zmart_cart", JSON.stringify(cart));
}

function showProducts(list = products) {
  const container = document.getElementById("products");
  if (!container) return;

  container.innerHTML = list.map(product => `
    <div class="product-card">
      <img src="${product.image}" alt="${product.name}">
      <h3>${product.name}</h3>
      <p>Rs. ${product.price.toLocaleString()}</p>
      <button onclick="addToCart(${product.id})">
        Add to Cart
      </button>
    </div>
  `).join("");
}

function addToCart(id) {
  const product = products.find(p => p.id === id);
  const existing = cart.find(item => item.id === id);

  if (existing) {
    existing.quantity++;
  } else {
    cart.push({...product, quantity: 1});
  }

  saveCart();
  updateCart();
  alert("Product added to cart!");
}

function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  saveCart();
  updateCart();
}

function changeQuantity(id, amount) {
  const item = cart.find(p => p.id === id);
  if (!item) return;

  item.quantity += amount;

  if (item.quantity <= 0) {
    removeFromCart(id);
  } else {
    saveCart();
    updateCart();
  }
}

function updateCart() {
  const count = document.getElementById("cart-count");
  const total = document.getElementById("cart-total");
  const list = document.getElementById("cart-items");

  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const amount = cart.reduce(
    (sum, item) => sum + item.price * item.quantity, 0
  );

  if (count) count.innerText = itemCount;
  if (total) total.innerText = amount.toLocaleString();

  if (list) {
    list.innerHTML = cart.length
      ? cart.map(item => `
        <div class="cart-item">
          <span>${item.name}</span>
          <span>Rs. ${item.price.toLocaleString()}</span>
          <button onclick="changeQuantity(${item.id}, -1)">−</button>
          ${item.quantity}
          <button onclick="changeQuantity(${item.id}, 1)">+</button>
          <button onclick="removeFromCart(${item.id})">Remove</button>
        </div>
      `).join("")
      : "<p>Your cart is empty.</p>";
  }
}

function searchProducts() {
  const search = document.getElementById("search").value.toLowerCase();

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search) ||
    p.category.toLowerCase().includes(search)
  );

  showProducts(filtered);
}

document.addEventListener("DOMContentLoaded", () => {
  showProducts();
  updateCart();
});
