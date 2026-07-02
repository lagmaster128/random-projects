(async function loadBundleCollection() {
  "use strict";

  const grid = document.getElementById("bundle-grid");
  const heading = document.getElementById("bundles-heading");
  const intro = document.getElementById("bundles-intro");
  const comparison = document.getElementById("bundle-comparison");
  const comparisonSection = document.querySelector(".bundle-comparison-section");
  const requestedType = new URLSearchParams(window.location.search).get("type") || "";
  const guidance = {
    starter: ["Starting with an empty kitchen?", "Cover the routines you'll use first. The rest can come later."],
    cooking: ["Make weeknight cooking easier", "A few versatile tools can handle more meals than a counter full of gadgets."],
    organization: ["Give a small kitchen room to work", "Keep daily tools close and leave yourself enough space to prepare food."],
    minimal: ["Get more from every purchase", "Look for tools that can do more than one job—and that you'll actually use."]
  };

  try {
    const bundles = await BundleData.getBundlesByType(requestedType);

    if (guidance[requestedType]) {
      [heading.textContent, intro.textContent] = guidance[requestedType];
    }

    bundles.forEach(bundle => {
      grid.appendChild(BundleUI.createBundleCard(bundle));
    });

    BundleUI.renderBundleComparison(comparison, bundles);

    if (bundles.length === 0) {
      grid.innerHTML = `
        <div class="catalog-message">
          <p>No bundles match that starting point.</p>
          <a class="text-button" href="bundles.html">View every kitchen bundle</a>
        </div>
      `;
      comparisonSection.hidden = true;
    }
  } catch (error) {
    grid.innerHTML = '<p class="catalog-message">Bundles could not be loaded. Please refresh the page.</p>';
    comparisonSection.hidden = true;
    console.error(error);
  }
})();
