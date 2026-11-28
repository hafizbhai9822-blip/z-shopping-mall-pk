
let products = [];
let cart = JSON.parse(localStorage.getItem("zmart_cart") || "[]");

function saveCart() {
  localStorage.setItem("zmart_cart", JSON.stringify(cart));
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;",
    '"': "&quot;", "'": "&#39;"
  }[c]));
}

async function loadProducts() {
  const container = document.getElementById("products");
  if (container) container.innerHTML = "Loading products...";

  const { data, error } = await supabaseClient
    .from("products")
    .select("id,name,description,price,image_url,stock")
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
        <img src="${escapeHTML(p.image_url || 'https://placehold.co/400x300?text=Product')}"
             alt="${escapeHTML(p.name)}">
        <h3>${escapeHTML(p.name)}</h3>
      </a>

      <p>Rs. ${Number(p.price).toLocaleString("en-PK")}</p>

      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px;">
        <button onclick="addToCart(${JSON.stringify(p.id)})"
          ${Number(p.stock) <= 0 ? "disabled" : ""}
          style="flex:1;">
          ${Number(p.stock) <= 0 ? "Out of Stock" : "Add to Cart"}
        </button>

        <button onclick="shopNow(${JSON.stringify(p.id)})"
          ${Number(p.stock) <= 0 ? "disabled" : ""}
          style="flex:1;background:#e67e22;color:white;">
          Shop Now
        </button>
      </div>
    </div>
  `).join("");
}

function addToCart(id) {
  const product = products.find(p => String(p.id) === String(id));
  if (!product || product.stock <= 0) return;

  const existing = cart.find(p => String(p.id) === String(id));

  if (existing) {
    if (existing.quantity >= product.stock) {
      alert("Available stock limit reached.");
      return;
    }
    existing.quantity++;
  } else {
    cart.push({...product, quantity: 1});
  }

  saveCart();
  updateCart();
}

function shopNow(id) {
  const product = products.find(p => String(p.id) === String(id));
  if (!product || product.stock <= 0) return;

  const existing = cart.find(p => String(p.id) === String(id));

  if (existing) {
    if (existing.quantity >= product.stock) {
      alert("Available stock limit reached.");
      return;
    }
    existing.quantity++;
  } else {
    cart.push({...product, quantity: 1});
  }

  saveCart();
  updateCart();

  const checkout = document.getElementById("checkout");

  if (checkout) {
    checkout.scrollIntoView({ behavior: "smooth" });
  }
}

function removeFromCart(id) {
  cart = cart.filter(p => String(p.id) !== String(id));
  saveCart();
  updateCart();
}

function changeQuantity(id, amount) {
  const item = cart.find(p => String(p.id) === String(id));
  const product = products.find(p => String(p.id) === String(id));
  if (!item) return;

  if (amount > 0 && product && item.quantity >= product.stock) {
    alert("Available stock limit reached.");
    return;
  }

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

  const itemCount = cart.reduce((s, p) => s + p.quantity, 0);
  const amount = cart.reduce((s, p) => s + Number(p.price) * p.quantity, 0);

  if (count) count.innerText = itemCount;
  if (total) total.innerText = amount.toLocaleString("en-PK");

  if (list) {
    list.innerHTML = cart.length ? cart.map(p => `
      <div class="cart-item">
        ${escapeHTML(p.name)} — Rs. ${Number(p.price).toLocaleString("en-PK")}
        <button onclick="changeQuantity(${JSON.stringify(p.id)},-1)">−</button>
        ${p.quantity}
        <button onclick="changeQuantity(${JSON.stringify(p.id)},1)">+</button>
        <button onclick="removeFromCart(${JSON.stringify(p.id)})">Remove</button>
      </div>
    `).join("") : "<p>Your cart is empty.</p>";
  }
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

document.addEventListener("DOMContentLoaded", async () => {
  updateCart();
  await loadProducts();

  const form = document.getElementById("checkout-form");

  if (form) {
    form.addEventListener("submit", async event => {
      event.preventDefault();

      if (!cart.length) {
        alert("Your cart is empty!");
        return;
      }

      const name = document.getElementById("customer-name").value.trim();
      const phone = document.getElementById("customer-phone").value.trim();
      const city = document.getElementById("customer-city").value.trim();
      const address = document.getElementById("customer-address").value.trim();
      const paymentMethod = document.getElementById("payment-method").value;

      if (!name || !phone || !city || !address) {
        alert("Please complete all delivery details.");
        return;
      }

      const total = cart.reduce(
        (sum, p) => sum + Number(p.price) * p.quantity, 0
      );

      const items = cart.map(p => ({
        product_id: p.id,
        product_name: p.name,
        quantity: p.quantity,
        unit_price: p.price,
        subtotal: Number(p.price) * p.quantity
      }));

      const { data, error } = await supabaseClient.rpc("place_order", {
        p_customer_name: name,
        p_phone: phone,
        p_city: city,
        p_address: address,
        p_items: items,
        p_payment_method: paymentMethod
      });

      if (error) {
        alert("Order could not be saved: " + error.message);
        console.error(error);
        return;
      }

      const orderNumber = data.order_number;

      let message = `New Order - Z.Shopping Mall.pk\n`;
      message += `Order Number: ${orderNumber}\n`;
      message += `Customer: ${name}\nPhone: ${phone}\n`;
      message += `City: ${city}\nAddress: ${address}\n`;
      message += `Payment Method: ${paymentMethod}\n\nProducts:\n`;

      cart.forEach(p => {
        message += `${p.name} x ${p.quantity} = Rs. ${Number(p.price) * p.quantity}\n`;
      });

      message += `\nTotal: Rs. ${total}`;

      if (paymentMethod !== "COD") {
        message += "\nPayment Status: Awaiting payment verification";
      }

      const whatsappLink =
        `https://wa.me/923026790033?text=${encodeURIComponent(message)}`;

      cart = [];
      saveCart();
      updateCart();
      form.reset();

      const paymentSelect = document.getElementById("payment-method");
      if (paymentSelect) {
        paymentSelect.dispatchEvent(new Event("change"));
      }

      alert("Your order has been saved successfully! Order Number: " + orderNumber);
      window.open(whatsappLink, "_blank");
    });
  }
});
