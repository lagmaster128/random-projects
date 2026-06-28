async function loadStorefront() {
  const productGrid = document.getElementById("product-grid");
  const bundleGrid = document.getElementById("bundle-grid");
  const journeyGrid = document.getElementById("journey-grid");

  const journeys = [
    {
      title: "Moving into your first apartment",
      description: "Start with the essentials you'll actually use.",
      href: "bundle.html?handle=first-apartment-kit"
    },
    {
      title: "Cooking more at home",
      description: "Practical tools for everyday meals.",
      href: "bundle.html?handle=everyday-cooking-kit"
    },
    {
      title: "Looking for more storage",
      description: "Simple organization for smaller kitchens.",
      href: "bundle.html?handle=small-kitchen-organization-kit"
    },
    {
      title: "Decluttering your kitchen",
      description: "Products chosen to earn their place.",
      href: "bundles.html#minimalist-collection"
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

    products.forEach(product => {
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
