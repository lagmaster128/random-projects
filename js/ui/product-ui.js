(function createProductUI(global) {
  "use strict";

  function createProductCard(product) {
    const safeProduct = prepareProduct(product);
    const productUrl = getProductUrl(safeProduct);
    const card = document.createElement("article");
    card.className = "product-card";
    card.setAttribute("itemscope", "");
    card.setAttribute("itemtype", "https://schema.org/Product");

    card.innerHTML = `
      <a class="product-image-link" href="${productUrl}" aria-label="View ${safeProduct.name}">
        <img src="${safeProduct.image}" alt="${safeProduct.name}" itemprop="image" loading="lazy" decoding="async">
      </a>

      <div class="product-card-content">
        <div class="product-card-badges" aria-label="Product philosophy"></div>
        <h3>
          <a href="${productUrl}" itemprop="url">
            <span itemprop="name">${safeProduct.name}</span>
          </a>
        </h3>
        <p class="product-price" itemprop="offers" itemscope itemtype="https://schema.org/Offer">
          <meta itemprop="priceCurrency" content="USD">
          $<span itemprop="price" content="${safeProduct.formattedPrice}">${safeProduct.formattedPrice}</span>
        </p>
        <button class="add-cart" type="button">Add to Cart</button>
      </div>
    `;

    const badgeGroup = card.querySelector(".product-card-badges");
    MinoValidator.safeArray(product?.philosophy).slice(0, 3).forEach(value => {
      const badge = global.GuidanceUI.createBadge(value);
      const labels = {
        essential: "Essential",
        multipurpose: "Multi-purpose",
        spacesaving: "Space-saving"
      };
      badge.textContent = labels[value] || MinoValidator.safeText(value);
      badgeGroup.appendChild(badge);
    });

    if (!badgeGroup.hasChildNodes()) {
      badgeGroup.remove();
    }

    bindAddButton(card.querySelector(".add-cart"), product);
    setupImageFallback(card);
    return card;
  }

  function renderProductDetail(container, product, relatedProducts = []) {
    const safeProduct = prepareProduct(product);
    const features = MinoValidator.safeArray(product?.features)
      .map(feature => `<li>${MinoValidator.escapeHtml(feature)}</li>`)
      .join("");

    container.innerHTML = `
      <article class="product-detail-page" itemscope itemtype="https://schema.org/Product">
        <div class="product-hero">
          <div class="product-image">
            <img src="${safeProduct.image}" alt="${safeProduct.name}" itemprop="image" decoding="async">
          </div>

          <div class="product-info">
            <p class="product-category">${safeProduct.category}</p>
            <h1 itemprop="name">${safeProduct.name}</h1>
            <div itemprop="offers" itemscope itemtype="https://schema.org/Offer">
              <meta itemprop="priceCurrency" content="USD">
              <h2>$<span itemprop="price" content="${safeProduct.formattedPrice}">${safeProduct.formattedPrice}</span></h2>
            </div>
            <p class="description" itemprop="description">${safeProduct.description}</p>
          </div>
        </div>

        <section class="product-selection" aria-labelledby="product-selection-heading">
          <div class="product-selection-content"></div>
        </section>

        <section class="features" aria-labelledby="product-features-heading">
          <h2 id="product-features-heading">Key Features</h2>
          <ul>
            ${features}
          </ul>
        </section>

        <div class="product-purchase">
          <button id="add-cart" type="button">Add to Cart</button>
        </div>

        <section class="related-products" aria-labelledby="related-products-heading">
          <h2 id="related-products-heading">Related Products</h2>
          <div class="product-grid related-product-grid"></div>
        </section>
      </article>
    `;

    bindAddButton(container.querySelector("#add-cart"), product);
    setupImageFallback(container);
    global.GuidanceUI.renderProductPhilosophy(
      container.querySelector(".product-selection-content"),
      product
    );

    const relatedGrid = container.querySelector(".related-product-grid");

    if (relatedProducts.length === 0) {
      relatedGrid.innerHTML = `
        <p class="catalog-message">Related products will appear here.</p>
      `;
      return;
    }

    relatedProducts.forEach(relatedProduct => {
      relatedGrid.appendChild(createProductCard(relatedProduct));
    });
  }

  function getProductUrl(product) {
    return `product.html?handle=${encodeURIComponent(MinoValidator.safeText(product?.handle))}`;
  }

  function prepareProduct(product) {
    const source = product && typeof product === "object" ? product : {};
    const price = MinoValidator.safeNumber(source.price);

    return {
      ...source,
      name: MinoValidator.escapeHtml(MinoValidator.safeText(source.name, "Product")),
      category: MinoValidator.escapeHtml(MinoValidator.safeText(source.category, "Products")),
      description: MinoValidator.escapeHtml(MinoValidator.safeText(source.description)),
      image: MinoValidator.escapeHtml(MinoValidator.safeImagePath(source.image)),
      formattedPrice: price.toFixed(2)
    };
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

  function setupImageFallback(scope) {
    MinoValidator.setupImageFallback(scope);
  }

  global.ProductUI = Object.freeze({
    createProductCard,
    getProductUrl,
    renderProductDetail,
    setupImageFallback
  });
})(window);
