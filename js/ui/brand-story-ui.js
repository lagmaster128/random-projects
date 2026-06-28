(function registerBrandStoryUI(global) {
  "use strict";

  const MISSION = "To help people create cleaner, more functional kitchens through thoughtfully curated essentials that reduce clutter, simplify everyday cooking, and make every product earn its place.";
  const PRINCIPLES = [
    "Solve a real problem",
    "Save space",
    "Be used often",
    "Look clean",
    "Last"
  ];
  const HOMEPAGE_PRINCIPLES = [
    "Thoughtfully curated.",
    "Built for everyday kitchens.",
    "Less clutter.",
    "Better cooking."
  ];

  class MinoMissionBlock extends HTMLElement {
    connectedCallback() {
      this.innerHTML = `
        <section class="mission-block" aria-labelledby="mission-block-heading">
          <p class="eyebrow">What guides us</p>
          <h2 id="mission-block-heading">Our Mission</h2>
          <p>${MISSION}</p>
        </section>
      `;
    }
  }

  class MinoBrandPrinciples extends HTMLElement {
    connectedCallback() {
      const principles = this.getAttribute("mode") === "homepage"
        ? HOMEPAGE_PRINCIPLES
        : PRINCIPLES;

      this.classList.add("brand-principle-grid");
      principles.forEach(principle => {
        const card = document.createElement("article");
        card.className = "brand-principle-card";

        const icon = document.createElement("span");
        icon.className = "brand-principle-icon";
        icon.setAttribute("aria-hidden", "true");
        icon.textContent = "✓";

        const heading = document.createElement("h3");
        heading.textContent = principle;
        card.append(icon, heading);
        this.appendChild(card);
      });
    }
  }

  class MinoMissionCallout extends HTMLElement {
    connectedCallback() {
      this.innerHTML = `
        <aside class="mission-callout" aria-labelledby="mission-callout-heading">
          <div>
            <p class="eyebrow">Our Mission</p>
            <h2 id="mission-callout-heading">A useful kitchen, with less clutter.</h2>
          </div>
          <p>${MISSION}</p>
        </aside>
      `;
    }
  }

  class MinoCtaBanner extends HTMLElement {
    connectedCallback() {
      const heading = this.getAttribute("heading") || "Own less. Cook better.";
      const copy = this.getAttribute("copy") || "";
      const href = this.getAttribute("href") || "bundles.html";
      const label = this.getAttribute("label") || "Browse Bundles";

      this.innerHTML = `
        <section class="brand-cta" aria-labelledby="brand-cta-heading">
          <h2 id="brand-cta-heading">${heading}</h2>
          ${copy ? `<p>${copy}</p>` : ""}
          <a class="hero-button" href="${href}">${label}</a>
        </section>
      `;
    }
  }

  if (!customElements.get("mino-mission-block")) {
    customElements.define("mino-mission-block", MinoMissionBlock);
  }
  if (!customElements.get("mino-brand-principles")) {
    customElements.define("mino-brand-principles", MinoBrandPrinciples);
  }
  if (!customElements.get("mino-mission-callout")) {
    customElements.define("mino-mission-callout", MinoMissionCallout);
  }
  if (!customElements.get("mino-cta-banner")) {
    customElements.define("mino-cta-banner", MinoCtaBanner);
  }

  global.BrandStory = Object.freeze({
    mission: MISSION,
    principles: [...PRINCIPLES]
  });
})(window);
