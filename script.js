
let products = [];
let cart = JSON.parse(localStorage.getItem("zmart_cart") || "[]");

function saveCart() {
  localStorage.setItem("zmart_cart", JSON.stringify(cart));
}

async function showProducts(list = products) {
  const container = document.getElementById("products");
  if (!container) return;

  if (list.length === 0) {
    container.innerHTML = "<p>No products found.</p>";
    return;
  }

  container.innerHTML = list.map(p => `
    <div class="product-card">
      <img src="${p.image_url || 'https://placehold.co/400x300?text=Product'}" alt="${p.name}">
      <h3>${escapeHTML(p.name)}</h3>
      <p>Rs. ${Number(p.price).toLocaleString()}</p>
      <button onclick="addToCart(${p.id})">Add to Cart</button>
    </div>
  `).join("");
}

async function loadProducts() {
  const container = document.getElementById("products");
  if (container) container.innerHTML = "<p>Loading products...</p>";

  const { data, error } = await supabaseClient
    .from("products")
    .select("id,name,description,price,image_url,category_id,stock")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    if (container) container.innerHTML = "<p>Products could not load.</p>";
    console.error(error);
    return;
  }

  products = data || [];
  showProducts();
}

function addToCart(id) {
  const product = products.find(p => p.id === id);
  if (!product) return;

  const existing = cart.find(item => item.id === id);

  if (existing) existing.quantity++;
  else cart.push({...product, quantity: 1});

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

  if (item.quantity <= 0) removeFromCart(id);
  else {
    saveCart();
    updateCart();
  }
}

function updateCart() {
  const counts = document.querySelectorAll("#cart-count");
  const total = document.getElementById("cart-total");
  const list = document.getElementById("cart-items");

  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const amount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  counts.forEach(el => el.innerText = itemCount);
  if (total) total.innerText = amount.toLocaleString();

  if (list) {
    list.innerHTML = cart.length
      ? cart.map(item => `
        <div class="cart-item">
          <span>${escapeHTML(item.name)}</span>
          <span>Rs. ${Number(item.price).toLocaleString()}</span>
          <button onclick="changeQuantity(${item.id},-1)">−</button>
          ${item.quantity}
          <button onclick="changeQuantity(${item.id},1)">+</button>
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
    (p.description || "").toLowerCase().includes(search)
  );

  showProducts(filtered);
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;",
    '"': "&quot;", "'": "&#39;"
  }[char]));
}

document.addEventListener("DOMContentLoaded", async function() {
  await loadProducts();
  updateCart();
});
