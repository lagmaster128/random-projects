(function createGuidanceUI(global) {
  "use strict";

  const PHILOSOPHY_LABELS = Object.freeze({
    essential: "Essential",
    multipurpose: "Multi-purpose",
    spacesaving: "Space-saving"
  });

  class MinoSectionHeader extends HTMLElement {
    connectedCallback() {
      const heading = this.getAttribute("heading") || "";
      const copy = this.getAttribute("copy") || "";
      const eyebrow = this.getAttribute("eyebrow") || "";
      const headingId = this.getAttribute("heading-id") || "";

      this.classList.add("section-header");
      this.innerHTML = `
        ${eyebrow ? `<p class="eyebrow">${eyebrow}</p>` : ""}
        <h2${headingId ? ` id="${headingId}"` : ""}>${heading}</h2>
        ${copy ? `<p>${copy}</p>` : ""}
      `;
    }
  }

  function createBadge(value) {
    const badge = document.createElement("span");
    badge.className = "philosophy-badge";
    badge.textContent = `✓ ${PHILOSOPHY_LABELS[value] || MinoValidator.safeText(value)}`;
    return badge;
  }

  function createApprovalMark(criteria = ["Mino Approved"]) {
    const safeCriteria = MinoValidator.safeArray(criteria)
      .map(value => MinoValidator.safeText(value))
      .filter(Boolean);
    const mark = document.createElement("div");
    mark.className = "mino-approved";
    mark.setAttribute("aria-label", safeCriteria.join(", "));

    const icon = document.createElement("span");
    icon.className = "mino-approved-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = "✓";

    const text = document.createElement("span");
    text.textContent = safeCriteria.join(" · ");
    mark.append(icon, text);
    return mark;
  }

  function renderProductPhilosophy(container, product) {
    const heading = document.createElement("h2");
    heading.id = "product-selection-heading";
    heading.textContent = "Why we chose this product";

    const approval = createApprovalMark(["Mino Approved"]);
    const badges = document.createElement("div");
    badges.className = "philosophy-badges";
    MinoValidator.safeArray(product?.philosophy)
      .forEach(value => badges.appendChild(createBadge(value)));

    const explanation = document.createElement("p");
    explanation.className = "philosophy-explanation";
    explanation.textContent = MinoValidator.safeText(product?.philosophyExplanation);

    const details = document.createElement("dl");
    details.className = "selection-grid";
    [
      ["Problem it solves", product?.problemSolved],
      ["Why it was chosen", product?.whyChosen],
      ["Space saving", product?.spaceSaving],
      ["Easy to clean", product?.easyToClean],
      ["Best for", product?.bestFor]
    ].forEach(([label, value]) => {
      const item = document.createElement("div");
      const term = document.createElement("dt");
      const description = document.createElement("dd");
      term.textContent = label;
      description.textContent = MinoValidator.safeText(value, "Details not available.");
      item.append(term, description);
      details.appendChild(item);
    });

    container.append(heading, approval, badges, explanation, details);
  }

  if (!customElements.get("mino-section-header")) {
    customElements.define("mino-section-header", MinoSectionHeader);
  }

  global.GuidanceUI = Object.freeze({
    createApprovalMark,
    createBadge,
    renderProductPhilosophy
  });
})(window);
