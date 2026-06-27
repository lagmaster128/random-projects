async function loadProduct() {

  const params = new URLSearchParams(window.location.search);

  const id = Number(params.get("id"));

  const response = await fetch("data/products.json");

  const products = await response.json();

  const product = products.find(p => p.id === id);

  const container = document.getElementById("product-detail");

  if (!product) {

    container.innerHTML = "<h2>Product not found.</h2>";

    return;

  }

  container.innerHTML = `
    <div class="product-layout">

      <div class="product-image">
        <img src="${product.image}" alt="${product.name}">
      </div>

      <div class="product-info">

        <h1>${product.name}</h1>

        <h2>$${product.price.toFixed(2)}</h2>

        <p class="description">${product.description}</p>

        <div class="features">
          <h3>Key Features</h3>
          <ul>
            ${product.features.map(f => `<li>${f}</li>`).join("")}
          </ul>
        </div>

        <button id="add-cart">Add to Cart</button>

      </div>

    </div>
  `;

  document
    .getElementById("add-cart")
    .addEventListener("click", () => {
      addToCart(product);
    });

}

loadProduct();
