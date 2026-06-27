async function loadProducts() {
  const productGrid = document.getElementById("product-grid");

  try {
    const response = await fetch("js/data/products.json");

    if (!response.ok) {
      throw new Error(`Unable to load products (${response.status})`);
    }

    const products = await response.json();
    products.forEach(product => {
      productGrid.appendChild(ProductUI.createProductCard(product));
    });
  } catch (error) {
    productGrid.innerHTML = `
      <p class="catalog-message">
        Featured products could not be loaded. Please refresh the page.
      </p>
    `;
    console.error(error);
  }
}

loadProducts();
