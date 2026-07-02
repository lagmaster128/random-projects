async function loadStorefront() {
  const productGrid = document.getElementById("product-grid");
  const bundleGrid = document.getElementById("bundle-grid");
  const journeyGrid = document.getElementById("journey-grid");

  const journeys = [
    {
      title: "Building my first kitchen",
      description: "Start with the basics, then let your real routines show you what to add next.",
      href: "bundles.html?type=starter"
    },
    {
      title: "Cooking more at home",
      description: "Choose versatile tools that make weeknight meals easier to pull together.",
      href: "bundles.html?type=cooking"
    },
    {
      title: "Making a small space work",
      description: "Protect your prep space and give the things you use most a sensible home.",
      href: "bundles.html?type=organization"
    },
    {
      title: "Simplifying my kitchen",
      description: "Keep the tools that do real work. Let the rest go.",
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
