let products = [];

async function loadProducts() {
  try {
    const response = await fetch("data/products.json");

    if (!response.ok) {
      throw new Error(`Unable to load products (${response.status})`);
    }

    products = await response.json();
    displayProducts(products);
  } catch (error) {
    const grid = document.getElementById("product-grid");
    grid.innerHTML = "<p>Products could not be loaded. Please refresh the page.</p>";
    console.error(error);
  }
}

function displayProducts(productList) {

  const grid = document.getElementById("product-grid");

  grid.innerHTML = "";

  productList.forEach(product => {

    const card = document.createElement("div");
    card.className = "product-card";

    card.innerHTML = `

      <a href="product.html?id=${product.id}">
        <img src="${product.image}" alt="${product.name}">
      </a>

      <h3>${product.name}</h3>

      <p>$${product.price.toFixed(2)}</p>

      <button class="add-cart">Add to Cart</button>

    `;

    // 👇 THIS is the important part
    card.querySelector(".add-cart").addEventListener("click", () => {
      addToCart(product);
    });

    grid.appendChild(card);

  });
}

document
  .getElementById("search")
  .addEventListener("input", function () {
    const term = this.value.toLowerCase();

    const filtered = products.filter(product =>
      product.name.toLowerCase().includes(term)
    );

    displayProducts(filtered);
  });

loadProducts();
