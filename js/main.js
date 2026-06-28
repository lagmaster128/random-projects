async function loadStorefront() {
  const productGrid = document.getElementById("product-grid");
  const collectionGrid = document.getElementById("collection-grid");

  try {
    const [products, collections] = await Promise.all([
      StoreData.getProducts(),
      StoreData.getCollections()
    ]);

    products.forEach(product => {
      productGrid.appendChild(ProductUI.createProductCard(product));
    });

    collections.forEach(collection => {
      collectionGrid.appendChild(createCollectionCard(collection));
    });
  } catch (error) {
    const message = `
      <p class="catalog-message">
        The collection could not be loaded. Please refresh the page.
      </p>
    `;
    productGrid.innerHTML = message;
    collectionGrid.innerHTML = message;
    console.error(error);
  }
}

function createCollectionCard(collection) {
  const link = document.createElement("a");
  link.className = "category-card";
  link.href = `products.html?collection=${encodeURIComponent(collection.handle)}`;

  const heading = document.createElement("h3");
  heading.textContent = collection.title;

  const description = document.createElement("p");
  description.textContent = collection.description;

  link.append(heading, description);
  return link;
}

loadStorefront();
