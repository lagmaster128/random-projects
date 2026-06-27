async function loadProduct() {
  const container = document.getElementById("product-detail");
  const id = Number(new URLSearchParams(window.location.search).get("id"));

  try {
    const response = await fetch("js/data/products.json");

    if (!response.ok) {
      throw new Error(`Unable to load products (${response.status})`);
    }

    const products = await response.json();
    const product = products.find(item => item.id === id);

    if (!product) {
      container.innerHTML = `
        <div class="catalog-message">
          <h1>Product not found</h1>
          <p>The product may have moved or is no longer available.</p>
          <a class="hero-button" href="products.html">Back to Products</a>
        </div>
      `;
      return;
    }

    ProductUI.renderProductDetail(container, product);
  } catch (error) {
    container.innerHTML = `
      <div class="catalog-message">
        <h1>Product unavailable</h1>
        <p>Please refresh the page or browse the rest of the collection.</p>
        <a class="hero-button" href="products.html">Browse Products</a>
      </div>
    `;
    console.error(error);
  }
}

loadProduct();
