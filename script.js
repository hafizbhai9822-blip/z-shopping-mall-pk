
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

let cart = [];

function showProducts() {
  const container = document.getElementById("products");
  if (!container) return;

  container.innerHTML = products.map(product => `
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
  cart.push(product);
  updateCart();
}

function updateCart() {
  const count = document.getElementById("cart-count");
  const total = document.getElementById("cart-total");

  if (count) count.innerText = cart.length;
  if (total) {
    total.innerText = cart.reduce((sum, item) => sum + item.price, 0);
  }
}

function searchProducts() {
  const search = document.getElementById("search").value.toLowerCase();

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search) ||
    p.category.toLowerCase().includes(search)
  );

  document.getElementById("products").innerHTML = filtered.map(product => `
    <div class="product-card">
      <img src="${product.image}" alt="${product.name}">
      <h3>${product.name}</h3>
      <p>Rs. ${product.price.toLocaleString()}</p>
      <button onclick="addToCart(${product.id})">Add to Cart</button>
    </div>
  `).join("");
}

document.addEventListener("DOMContentLoaded", showProducts);
