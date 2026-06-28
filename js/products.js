let products = [];
let collections = [];
let activeCollection = "all";
let searchTerm = "";
let sortMode = "featured";
let filterButtons = [];

const grid = document.getElementById("product-grid");
const searchInput = document.getElementById("search");
const sortSelect = document.getElementById("sort");
const productCount = document.getElementById("product-count");
const filterContainer = document.getElementById("collection-filters");

async function loadCatalog() {
  try {
    [products, collections] = await Promise.all([
      StoreData.getProducts(),
      StoreData.getCollections()
    ]);

    renderCollectionFilters();
    setInitialCollection();
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

function renderCollectionFilters() {
  filterContainer.innerHTML = "";
  filterContainer.appendChild(createFilterButton("all", "All"));

  collections.forEach(collection => {
    filterContainer.appendChild(
      createFilterButton(collection.handle, collection.title)
    );
  });

  filterButtons = [...filterContainer.querySelectorAll(".filter-button")];
}

function createFilterButton(handle, title) {
  const button = document.createElement("button");
  button.className = "filter-button";
  button.type = "button";
  button.dataset.collection = handle;
  button.textContent = title;

  button.addEventListener("click", () => {
    activeCollection = handle;
    updateActiveFilterButton();
    applyCatalogFilters();
  });

  return button;
}

function setInitialCollection() {
  const requestedCollection = new URLSearchParams(window.location.search).get(
    "collection"
  );

  if (
    requestedCollection &&
    collections.some(collection => collection.handle === requestedCollection)
  ) {
    activeCollection = requestedCollection;
  }

  updateActiveFilterButton();
}

function applyCatalogFilters() {
  let visibleProducts = products.filter(product => {
    const matchesCollection =
      activeCollection === "all" ||
      product.collection.handle === activeCollection;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm);

    return matchesCollection && matchesSearch;
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
        No products match those filters. Try another search or collection.
      </p>
    `;
    return;
  }

  productList.forEach(product => {
    grid.appendChild(ProductUI.createProductCard(product));
  });
}

function updateActiveFilterButton() {
  filterButtons.forEach(button => {
    const isActive = button.dataset.collection === activeCollection;
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

loadCatalog();
