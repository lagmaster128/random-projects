let cart = JSON.parse(localStorage.getItem("cart")) || [];

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function addToCart(product) {

  const existing = cart.find(item => item.id === product.id);

  if (existing) {
    existing.quantity++;
  } else {
    cart.push({
      ...product,
      quantity: 1
    });
  }

  saveCart();

  updateCartCount();

  alert(`${product.name} added to cart!`);
}

function updateCartCount() {
  const el = document.getElementById("cart-count");

  if (el) {
    el.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
  }
}

function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  saveCart();
  updateCartCount();
}

function updateQuantity(id, delta) {
  const item = cart.find(p => p.id === id);
  if (!item) return;

  item.quantity += delta;

  if (item.quantity <= 0) {
    removeFromCart(id);
  } else {
    saveCart();
    updateCartCount();
  }
}

updateCartCount();
