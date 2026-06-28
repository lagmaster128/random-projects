async function loadStorefront() {
  const productGrid = document.getElementById("product-grid");
  const bundleGrid = document.getElementById("bundle-grid");
  const journeyGrid = document.getElementById("journey-grid");

  const journeys = [
    {
      title: "Moving into my first apartment",
      description: "Start with the essentials you'll actually use.",
      href: "bundles.html?type=starter"
    },
    {
      title: "Cooking more at home",
      description: "Reliable tools for everyday meals.",
      href: "bundles.html?type=cooking"
    },
    {
      title: "Need more storage",
      description: "Simple organization for smaller kitchens.",
      href: "bundles.html?type=organization"
    },
    {
      title: "Simplifying my kitchen",
      description: "Own less. Cook better.",
      href: "bundles.html?type=minimal"
    }
  ];

  try {
    const [products, bundles] = await Promise.all([
      StoreData.getProducts(),
      BundleData.getBundles()
    ]);

    journeys.forEach(journey => {
      journeyGrid.appendChild(BundleUI.createJourneyCard(journey));
    });

    bundles.slice(0, 3).forEach(bundle => {
      bundleGrid.appendChild(BundleUI.createBundleCard(bundle));
    });

    products.slice(0, 3).forEach(product => {
      productGrid.appendChild(ProductUI.createProductCard(product));
    });
  } catch (error) {
    const message = `
      <p class="catalog-message">
        The collection could not be loaded. Please refresh the page.
      </p>
    `;
    productGrid.innerHTML = message;
    bundleGrid.innerHTML = message;
    journeyGrid.innerHTML = message;
    console.error(error);
  }
}

loadStorefront();
