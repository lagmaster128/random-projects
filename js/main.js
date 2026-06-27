async function loadProducts() {
  const response = await fetch("data/products.json");
  const products = await response.json();

  const productGrid = document.getElementById("product-grid");

  products.forEach(product => {

    const card = document.createElement("div");
    card.className = "product-card";

    card.innerHTML = `
      <img src="${product.image}" alt="${product.name}">

      <h3>${product.name}</h3>

      <p>$${product.price.toFixed(2)}</p>

    <button class="add-cart">
      Add to Cart
    </button>
    `;

    productGrid.appendChild(card);

  });
}

loadProducts();