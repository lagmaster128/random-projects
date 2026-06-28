(async function loadBundlePage() {
  "use strict";

  const container = document.getElementById("bundle-detail");
  const handle = new URLSearchParams(window.location.search).get("handle");

  try {
    const bundle = handle ? await BundleData.getBundleByHandle(handle) : null;

    if (!bundle) {
      container.innerHTML = `
        <p class="eyebrow">Bundles</p>
        <h1>Bundle not found</h1>
        <p>This bundle may have moved or is not available yet.</p>
        <a class="hero-button" href="bundles.html">View all bundles</a>
      `;
      return;
    }

    document.title = `${bundle.name} | Mino Kitchens`;
    container.innerHTML = `
      <p class="eyebrow">Coming Soon</p>
      <h1>${bundle.name}</h1>
      <p>${bundle.description}</p>

      <div class="bundle-placeholder-details">
        <div>
          <span>Designed for</span>
          <strong>${bundle.idealFor}</strong>
        </div>
        <div>
          <span>Includes</span>
          <strong>${bundle.includedProducts.length} products</strong>
        </div>
      </div>

      <p class="bundle-status">Purchasing will be available when the bundle collection launches.</p>
      <div class="placeholder-actions">
        <a class="hero-button" href="products.html">Browse individual products</a>
        <a class="secondary-button" href="bundles.html">All bundles</a>
      </div>
    `;
  } catch (error) {
    container.innerHTML = `
      <p class="catalog-message">Bundle details could not be loaded. Please refresh the page.</p>
    `;
    console.error(error);
  }
})();
