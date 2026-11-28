
let products = [];

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, c => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[c]));
}

function formatPrice(price) {
  return Number(price || 0).toLocaleString("en-PK");
}

function getDiscountHTML(product) {
  const original = Number(product.original_price || 0);
  const sale = Number(product.price || 0);
  const discount = Number(product.discount_percent || 0);

  if (discount > 0 && original > sale) {
    return `
      <div style="margin:8px 0;">
        <span style="color:#888;text-decoration:line-through;">
          Rs. ${formatPrice(original)}
        </span>
        <strong style="color:#e63946;font-size:19px;margin-left:7px;">
          Rs. ${formatPrice(sale)}
        </strong>
        <span style="background:#e63946;color:white;padding:4px 7px;
          border-radius:4px;font-size:12px;margin-left:5px;">
          SALE ${discount}% OFF
        </span>
      </div>
    `;
  }

  return `<p><strong>Rs. ${formatPrice(sale)}</strong></p>`;
}

async function loadProducts() {
  const container = document.getElementById("products");
  if (container) container.innerHTML = "Loading products...";

  const { data, error } = await supabaseClient
    .from("products")
    .select("id,name,description,price,original_price,discount_percent,image_url,stock")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    if (container) container.innerText = "Products could not load.";
    console.error(error);
    return;
  }

  products = data || [];
  showProducts();
}

function showProducts(list = products) {
  const container = document.getElementById("products");
  if (!container) return;

  if (!list.length) {
    container.innerHTML = "<p>No products found.</p>";
    return;
  }

  container.innerHTML = list.map(p => `
    <div class="product-card">
      <a href="product.html?id=${encodeURIComponent(p.id)}"
         style="color:inherit;text-decoration:none;">
        <img
          src="${escapeHTML(p.image_url || 'https://placehold.co/400x300?text=Product')}"
          alt="${escapeHTML(p.name)}">
        <h3>${escapeHTML(p.name)}</h3>
      </a>

      ${getDiscountHTML(p)}

      <a href="product.html?id=${encodeURIComponent(p.id)}"
         style="display:block;text-align:center;background:#087f5b;
         color:white;padding:11px;border-radius:6px;text-decoration:none;
         margin-top:10px;">
        ${Number(p.stock) <= 0 ? "View Details" : "View Details & Order"}
      </a>
    </div>
  `).join("");
}

function searchProducts() {
  const searchInput = document.getElementById("search");
  if (!searchInput) return;

  const search = searchInput.value.toLowerCase();

  showProducts(products.filter(p =>
    (p.name || "").toLowerCase().includes(search) ||
    (p.description || "").toLowerCase().includes(search)
  ));
}

document.addEventListener("DOMContentLoaded", loadProducts);
