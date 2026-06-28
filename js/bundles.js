(async function loadBundleCollection() {
  "use strict";

  const grid = document.getElementById("bundle-grid");
  const heading = document.getElementById("bundles-heading");
  const intro = document.getElementById("bundles-intro");
  const requestedType = new URLSearchParams(window.location.search).get("type") || "";
  const guidance = {
    starter: ["First apartment essentials", "A practical starting point for a newly equipped kitchen."],
    cooking: ["Tools for cooking more at home", "A focused set for reliable everyday meals."],
    organization: ["Solutions for smaller kitchens", "Compact choices that keep regular routines manageable."],
    minimal: ["A simpler kitchen", "Multi-purpose tools selected to earn their place."]
  };

  try {
    const bundles = await BundleData.getBundlesByType(requestedType);

    if (guidance[requestedType]) {
      [heading.textContent, intro.textContent] = guidance[requestedType];
    }

    bundles.forEach(bundle => {
      grid.appendChild(BundleUI.createBundleCard(bundle));
    });

    if (bundles.length === 0) {
      grid.innerHTML = '<p class="catalog-message">No bundles match this path yet.</p>';
    }
  } catch (error) {
    grid.innerHTML = '<p class="catalog-message">Bundles could not be loaded. Please refresh the page.</p>';
    console.error(error);
  }
})();
