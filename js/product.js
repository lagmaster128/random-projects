async function loadProduct() {
  const container = document.getElementById("product-detail");
  const params = new URLSearchParams(window.location.search);
  const handle = params.get("handle");
  const legacyId = params.get("id");

  try {
    const product = handle
      ? await StoreData.getProductByHandle(handle)
      : await StoreData.getProductById(legacyId);

    if (!product) {
      renderProductMessage(
        container,
        "Product not found",
        "The product may have moved or is no longer available."
      );
      return;
    }

    updateProductMetadata(product);
    ProductUI.renderProductDetail(container, product);
  } catch (error) {
    renderProductMessage(
      container,
      "Product unavailable",
      "Please refresh the page or browse the rest of the collection."
    );
    console.error(error);
  }
}

function updateProductMetadata(product) {
  document.title = product.seo.title;

  const description = document.querySelector('meta[name="description"]');
  description.setAttribute("content", product.seo.description);

  const canonical = document.querySelector('link[rel="canonical"]');
  canonical.setAttribute(
    "href",
    new URL(
      `product.html?handle=${encodeURIComponent(product.handle)}`,
      window.location.href
    ).href
  );
}

function renderProductMessage(container, heading, copy) {
  container.innerHTML = `
    <div class="catalog-message">
      <h1>${heading}</h1>
      <p>${copy}</p>
      <a class="hero-button" href="products.html">Browse Products</a>
    </div>
  `;
}

loadProduct();
