(function createProductUI(global) {
  "use strict";

  function createProductCard(product, options = {}) {
    const { showCategory = true } = options;
    const card = document.createElement("article");
    card.className = "product-card";

    card.innerHTML = `
      <a class="product-image-link" href="product.html?id=${product.id}">
        <img src="${product.image}" alt="${product.name}">
      </a>

      <div class="product-card-content">
        ${
          showCategory
            ? `<p class="product-category">${product.category}</p>`
            : ""
        }
        <h3>
          <a href="product.html?id=${product.id}">${product.name}</a>
        </h3>
        <p class="product-price">$${product.price.toFixed(2)}</p>
        <button class="add-cart" type="button">Add to Cart</button>
      </div>
    `;

    bindAddButton(card.querySelector(".add-cart"), product);
    return card;
  }

  function renderProductDetail(container, product) {
    container.innerHTML = `
      <div class="product-layout">
        <div class="product-image">
          <img src="${product.image}" alt="${product.name}">
        </div>

        <div class="product-info">
          <p class="product-category">${product.category}</p>
          <h1>${product.name}</h1>
          <h2>$${product.price.toFixed(2)}</h2>
          <p class="description">${product.description}</p>

          <div class="features">
            <h3>Key Features</h3>
            <ul>
              ${product.features.map(feature => `<li>${feature}</li>`).join("")}
            </ul>
          </div>

          <button id="add-cart" type="button">Add to Cart</button>
        </div>
      </div>
    `;

    bindAddButton(container.querySelector("#add-cart"), product);
  }

  function bindAddButton(button, product) {
    button.addEventListener("click", () => {
      global.Cart.addItem(product);
      showAddedFeedback(button);
    });
  }

  function showAddedFeedback(button) {
    const originalText = button.textContent;
    button.textContent = "Added";
    button.classList.add("added");
    button.disabled = true;

    global.setTimeout(() => {
      button.textContent = originalText;
      button.classList.remove("added");
      button.disabled = false;
    }, 700);
  }

  global.ProductUI = Object.freeze({
    createProductCard,
    renderProductDetail
  });
})(window);
