(function createProductUI(global) {
  "use strict";

  function createProductCard(product) {
    const productUrl = getProductUrl(product);
    const card = document.createElement("article");
    card.className = "product-card";
    card.setAttribute("itemscope", "");
    card.setAttribute("itemtype", "https://schema.org/Product");

    card.innerHTML = `
      <a class="product-image-link" href="${productUrl}">
        <img src="${product.image}" alt="${product.name}" itemprop="image">
      </a>

      <div class="product-card-content">
        <h3>
          <a href="${productUrl}" itemprop="url">
            <span itemprop="name">${product.name}</span>
          </a>
        </h3>
        <p class="product-price" itemprop="offers" itemscope itemtype="https://schema.org/Offer">
          <meta itemprop="priceCurrency" content="USD">
          $<span itemprop="price" content="${product.price.toFixed(2)}">${product.price.toFixed(2)}</span>
        </p>
        <button class="add-cart" type="button">Add to Cart</button>
      </div>
    `;

    bindAddButton(card.querySelector(".add-cart"), product);
    return card;
  }

  function renderProductDetail(container, product) {
    container.innerHTML = `
      <article class="product-layout" itemscope itemtype="https://schema.org/Product">
        <div class="product-image">
          <img src="${product.image}" alt="${product.name}" itemprop="image">
        </div>

        <div class="product-info">
          <p class="product-category">${product.category}</p>
          <h1 itemprop="name">${product.name}</h1>
          <div itemprop="offers" itemscope itemtype="https://schema.org/Offer">
            <meta itemprop="priceCurrency" content="USD">
            <h2>$<span itemprop="price" content="${product.price.toFixed(2)}">${product.price.toFixed(2)}</span></h2>
          </div>
          <p class="description" itemprop="description">${product.description}</p>

          <div class="features">
            <h3>Details</h3>
            <ul>
              ${product.features.map(feature => `<li>${feature}</li>`).join("")}
            </ul>
          </div>

          <button id="add-cart" type="button">Add to Cart</button>
        </div>
      </article>
    `;

    bindAddButton(container.querySelector("#add-cart"), product);
  }

  function getProductUrl(product) {
    return `product.html?handle=${encodeURIComponent(product.handle)}`;
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
    getProductUrl,
    renderProductDetail
  });
})(window);
