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

    const [includedProducts, optionalProducts] = await Promise.all([
      StoreData.getProductsByIds(bundle.includedProducts),
      StoreData.getProductsByHandles(bundle.optionalAdditions)
    ]);

    document.title = `${bundle.name} | Mino Kitchens`;
    document.querySelector('meta[name="description"]').setAttribute(
      "content",
      bundle.problemSolved
    );
    BundleUI.renderBundleDetail(
      container,
      bundle,
      includedProducts,
      optionalProducts
    );
  } catch (error) {
    container.innerHTML = `
      <p class="catalog-message">Bundle details could not be loaded. Please refresh the page.</p>
    `;
    console.error(error);
  }
})();
