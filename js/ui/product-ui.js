(function createProductUI(global) {
  "use strict";

  function createProductCard(product) {
    const productUrl = getProductUrl(product);
    const card = document.createElement("article");
    card.className = "product-card";
    card.setAttribute("itemscope", "");
    card.setAttribute("itemtype", "https://schema.org/Product");

    card.innerHTML = `
      <a class="product-image-link" href="${productUrl}" aria-label="View ${product.name}">
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
    setupImageFallback(card);
    return card;
  }

  function renderProductDetail(container, product, relatedProducts = []) {
    container.innerHTML = `
      <article class="product-detail-page" itemscope itemtype="https://schema.org/Product">
        <div class="product-hero">
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
          </div>
        </div>

        <section class="product-benefits" aria-labelledby="product-benefits-heading">
          <h2 id="product-benefits-heading">Why you'll like it</h2>
          <div class="benefit-grid">
            ${createBenefit("What it solves", product.problemSolved)}
            ${createBenefit("Why it's practical", product.whyItsPractical)}
            ${createBenefit("Space saving", product.spaceSaving)}
            ${createBenefit("Easy to clean", product.easyToClean)}
          </div>
        </section>

        <section class="features" aria-labelledby="product-features-heading">
          <h2 id="product-features-heading">Key Features</h2>
          <ul>
            ${product.features.map(feature => `<li>${feature}</li>`).join("")}
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

  function createBenefit(heading, copy) {
    return `
      <article class="benefit-card">
        <h3>${heading}</h3>
        <p>${copy}</p>
      </article>
    `;
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

  function setupImageFallback(scope) {
    scope.querySelectorAll("img").forEach(image => {
      const showPlaceholder = () => {
        const wrapper = image.closest(".product-image-link, .product-image");

        if (!wrapper || wrapper.classList.contains("image-placeholder")) {
          return;
        }

        wrapper.classList.add("image-placeholder");
        image.hidden = true;

        if (!wrapper.matches("a")) {
          wrapper.setAttribute("role", "img");
          wrapper.setAttribute("aria-label", `${image.alt} image placeholder`);
        }
      };

      image.addEventListener("error", showPlaceholder, { once: true });

      if (image.complete && image.naturalWidth === 0) {
        showPlaceholder();
      }
    });
  }

  global.ProductUI = Object.freeze({
    createProductCard,
    getProductUrl,
    renderProductDetail
  });
})(window);
