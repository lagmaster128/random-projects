(function createBundleUI(global) {
  "use strict";

  function createBundleCard(bundle) {
    const card = document.createElement("article");
    card.className = "bundle-card";

    card.innerHTML = `
      <div
        class="bundle-image image-placeholder"
        role="img"
        aria-label="${bundle.name} image placeholder"
      ></div>
      <div class="bundle-card-content">
        <h3>${bundle.name}</h3>
        <p>${bundle.description}</p>
        <span class="bundle-count">
          ${formatProductCount(bundle.includedProducts.length)}
        </span>
        <a
          class="secondary-button"
          href="bundle.html?handle=${encodeURIComponent(bundle.handle)}"
        >View Bundle</a>
      </div>
    `;

    return card;
  }

  function createJourneyCard(journey) {
    const link = document.createElement("a");
    link.className = "journey-card";
    link.href = journey.href;

    const heading = document.createElement("h3");
    heading.textContent = journey.title;

    const description = document.createElement("p");
    description.textContent = journey.description;

    const direction = document.createElement("span");
    direction.className = "journey-direction";
    direction.textContent = "Explore this path";

    link.append(heading, description, direction);
    return link;
  }

  function formatProductCount(count) {
    return `${count} included ${count === 1 ? "product" : "products"}`;
  }

  global.BundleUI = Object.freeze({
    createBundleCard,
    createJourneyCard
  });
})(window);
