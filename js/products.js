let products = [];
let activeCategory = "all";
let searchTerm = "";
let sortMode = "featured";

const grid = document.getElementById("product-grid");
const searchInput = document.getElementById("search");
const sortSelect = document.getElementById("sort");
const productCount = document.getElementById("product-count");
const filterButtons = document.querySelectorAll(".filter-button");

async function loadProducts() {
  try {
    const response = await fetch("data/products.json");

    if (!response.ok) {
      throw new Error(`Unable to load products (${response.status})`);
    }

    products = await response.json();
    setInitialCategory();
    applyCatalogFilters();
  } catch (error) {
    grid.innerHTML = `
      <p class="catalog-message">
        Products could not be loaded. Please refresh the page.
      </p>
    `;
    productCount.textContent = "";
    console.error(error);
  }
}

function setInitialCategory() {
  const requestedCategory = new URLSearchParams(window.location.search).get("category");
  const categories = new Set(products.map(product => product.category));

  if (requestedCategory && categories.has(requestedCategory)) {
    activeCategory = requestedCategory;
  }

  updateActiveFilterButton();
}

function applyCatalogFilters() {
  let visibleProducts = products.filter(product => {
    const matchesCategory =
      activeCategory === "all" || product.category === activeCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm);

    return matchesCategory && matchesSearch;
  });

  if (sortMode === "price-asc") {
    visibleProducts = [...visibleProducts].sort((a, b) => a.price - b.price);
  }

  displayProducts(visibleProducts);
}

function displayProducts(productList) {
  grid.innerHTML = "";

  productCount.textContent = `${productList.length} ${
    productList.length === 1 ? "product" : "products"
  }`;

  if (productList.length === 0) {
    grid.innerHTML = `
      <p class="catalog-message">
        No products match those filters. Try another search or category.
      </p>
    `;
    return;
  }

  productList.forEach(product => {
    const card = document.createElement("article");
    card.className = "product-card";

    card.innerHTML = `
      <a class="product-image-link" href="product.html?id=${product.id}">
        <img src="${product.image}" alt="${product.name}">
      </a>

      <div class="product-card-content">
        <p class="product-category">${product.category}</p>
        <h3>
          <a href="product.html?id=${product.id}">${product.name}</a>
        </h3>
        <p class="product-price">$${product.price.toFixed(2)}</p>
        <button class="add-cart" type="button">Add to Cart</button>
      </div>
    `;

    card.querySelector(".add-cart").addEventListener("click", () => {
      addToCart(product);
    });

    grid.appendChild(card);
  });
}

function updateActiveFilterButton() {
  filterButtons.forEach(button => {
    const isActive = button.dataset.category === activeCategory;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

searchInput.addEventListener("input", event => {
  searchTerm = event.target.value.trim().toLowerCase();
  applyCatalogFilters();
});

sortSelect.addEventListener("change", event => {
  sortMode = event.target.value;
  applyCatalogFilters();
});

filterButtons.forEach(button => {
  button.addEventListener("click", () => {
    activeCategory = button.dataset.category;
    updateActiveFilterButton();
    applyCatalogFilters();
  });
});

loadProducts();
