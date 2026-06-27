const container = document.getElementById("cart-items");
const totalEl = document.getElementById("cart-total");

function renderCart() {
  container.innerHTML = "";

  let total = 0;

  cart.forEach(item => {
    total += item.price * item.quantity;

    const div = document.createElement("div");
    div.className = "cart-item";

    div.innerHTML = `
      <h3>${item.name}</h3>
      <p>$${item.price.toFixed(2)}</p>

      <div class="qty-controls">
        <button class="minus">-</button>
        <span>${item.quantity}</span>
        <button class="plus">+</button>
      </div>

      <button class="remove">Remove</button>
    `;

    div.querySelector(".plus").onclick = () => {
      updateQuantity(item.id, 1);
      renderCart();
    };

    div.querySelector(".minus").onclick = () => {
      updateQuantity(item.id, -1);
      renderCart();
    };

    div.querySelector(".remove").onclick = () => {
      removeFromCart(item.id);
      renderCart();
    };

    container.appendChild(div);
  });

  totalEl.textContent = `Total: $${total.toFixed(2)}`;
}

renderCart();
