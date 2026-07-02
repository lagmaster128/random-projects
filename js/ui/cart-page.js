(function createCartPage(global) {
  "use strict";

  const container = document.getElementById("cart-items");
  const summary = document.getElementById("cart-summary");
  const subtotalElement = document.getElementById("cart-subtotal");

  function renderCart(items) {
    container.replaceChildren();

    if (items.length === 0) {
      renderEmptyCart();
      summary.hidden = true;
      subtotalElement.textContent = "$0.00";
      return;
    }

    const fragment = document.createDocumentFragment();
    items.forEach(item => fragment.appendChild(createCartItem(item)));
    container.appendChild(fragment);

    subtotalElement.textContent = `$${global.Cart.getSubtotal().toFixed(2)}`;
    summary.hidden = false;
  }

  function createCartItem(item) {
    const article = document.createElement("article");
    article.className = "cart-item";
    article.dataset.id = global.Cart.getItemIdentity(item);

    const details = document.createElement("div");
    details.className = "cart-item-details";

    const name = document.createElement("h2");
    name.textContent = item.name;

    const unitPrice = document.createElement("p");
    unitPrice.className = "cart-item-price";
    unitPrice.textContent = `$${item.price.toFixed(2)} each`;

    details.append(name, unitPrice);

    const controls = document.createElement("div");
    controls.className = "qty-controls";
    controls.setAttribute("aria-label", `Quantity for ${item.name}`);
    controls.append(
      createActionButton("−", "decrease", `Decrease ${item.name} quantity`),
      createQuantity(item.quantity),
      createActionButton("+", "increase", `Increase ${item.name} quantity`)
    );

    const lineTotal = document.createElement("strong");
    lineTotal.className = "cart-line-total";
    lineTotal.textContent = `$${(item.price * item.quantity).toFixed(2)}`;

    const remove = createActionButton("Remove", "remove", `Remove ${item.name}`);
    remove.classList.add("remove");

    article.append(details, controls, lineTotal, remove);
    return article;
  }

  function createActionButton(text, action, label) {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.action = action;
    button.textContent = text;
    button.setAttribute("aria-label", label);
    return button;
  }

  function createQuantity(quantity) {
    const value = document.createElement("span");
    value.className = "qty-value";
    value.textContent = quantity;
    value.setAttribute("aria-live", "polite");
    return value;
  }

  function renderEmptyCart() {
    const emptyState = document.createElement("div");
    emptyState.className = "empty-cart";

    const heading = document.createElement("h2");
    heading.textContent = "Your cart is empty";

    const copy = document.createElement("p");
    copy.textContent = "Start with a bundle built around your routine, then add individual essentials only when needed.";

    const link = document.createElement("a");
    link.className = "hero-button";
    link.href = "bundles.html";
    link.textContent = "Browse kitchen bundles";

    emptyState.append(heading, copy, link);
    container.appendChild(emptyState);
  }

  container.addEventListener("click", event => {
    const button = event.target.closest("button[data-action]");

    if (!button) {
      return;
    }

    const item = button.closest(".cart-item");
    const id = item?.dataset.id;

    if (!id) {
      return;
    }

    if (button.dataset.action === "increase") {
      global.Cart.updateQuantity(id, 1);
    }

    if (button.dataset.action === "decrease") {
      global.Cart.updateQuantity(id, -1);
    }

    if (button.dataset.action === "remove") {
      global.Cart.removeItem(id);
    }
  });

  global.Cart.subscribe(renderCart);
})(window);
