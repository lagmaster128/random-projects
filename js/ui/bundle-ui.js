(function createBundleUI(global) {
  "use strict";

  function createBundleCard(bundle) {
    const name = MinoValidator.escapeHtml(MinoValidator.safeText(bundle?.name, "Bundle"));
    const description = MinoValidator.escapeHtml(MinoValidator.safeText(bundle?.description));
    const image = MinoValidator.escapeHtml(MinoValidator.safeImagePath(bundle?.image));
    const includedProducts = MinoValidator.safeArray(bundle?.includedProducts);
    const card = document.createElement("article");
    card.className = "bundle-card";

    card.innerHTML = `
      <div
        class="bundle-image${image ? "" : " image-placeholder"}"
        role="img"
        aria-label="${name}${image ? "" : " image placeholder"}"
      >${image ? `<img src="${image}" alt="${name}">` : ""}</div>
      <div class="bundle-card-content">
        <h3>${name}</h3>
        <p>${description}</p>
        <div class="bundle-approval"></div>
        <span class="bundle-count">
          ${formatProductCount(includedProducts.length)}
        </span>
        <a
          class="secondary-button"
          href="bundle.html?handle=${encodeURIComponent(MinoValidator.safeText(bundle?.handle))}"
        >View Bundle</a>
      </div>
    `;

    card.querySelector(".bundle-approval").appendChild(
      global.GuidanceUI.createApprovalMark(["Mino Approved"])
    );
    MinoValidator.setupImageFallback(card);

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

  function renderBundleDetail(container, bundle, includedProducts, optionalProducts) {
    const name = MinoValidator.escapeHtml(MinoValidator.safeText(bundle?.name, "Bundle"));
    const description = MinoValidator.escapeHtml(MinoValidator.safeText(bundle?.description));
    const problemSolved = MinoValidator.safeText(bundle?.problemSolved);
    const idealFor = MinoValidator.safeText(bundle?.idealFor);
    const whyTogether = MinoValidator.escapeHtml(MinoValidator.safeText(bundle?.whyTogether));
    const ctaLabel = MinoValidator.escapeHtml(MinoValidator.safeText(bundle?.ctaLabel, "Review the included products"));
    const image = MinoValidator.escapeHtml(MinoValidator.safeImagePath(bundle?.image));
    const faqs = MinoValidator.safeArray(bundle?.faqs);
    const safeIncludedProducts = MinoValidator.safeArray(includedProducts);
    const safeOptionalProducts = MinoValidator.safeArray(optionalProducts);

    container.className = "bundle-detail-page container";
    container.innerHTML = `
      <article>
        <header class="bundle-detail-hero">
          <div class="bundle-detail-intro">
            <p class="eyebrow">Curated solution</p>
            <h1>${name}</h1>
            <p>${description}</p>
            <div class="bundle-detail-approval"></div>
          </div>
          <div class="bundle-detail-image${image ? "" : " image-placeholder"}" role="img" aria-label="${name}${image ? "" : " image placeholder"}">${image ? `<img src="${image}" alt="${name}">` : ""}</div>
        </header>

        <section class="bundle-guidance-grid" aria-label="Bundle guidance">
          ${createGuidanceBlock("Why this bundle exists", problemSolved)}
          ${createGuidanceBlock("Who it is for", idealFor)}
        </section>

        <section id="included-products" class="bundle-products-section" aria-labelledby="included-products-heading">
          <mino-section-header
            heading="Included products"
            copy="A small set selected to cover the core routine."
          ></mino-section-header>
          <div class="product-grid included-product-grid"></div>
        </section>

        <section class="bundle-rationale" aria-labelledby="bundle-rationale-heading">
          <h2 id="bundle-rationale-heading">Why these products were chosen together</h2>
          <p>${whyTogether}</p>
        </section>

        <section class="bundle-products-section optional-products" aria-labelledby="optional-products-heading">
          <mino-section-header
            heading="You may also like"
            copy="Optional additions that complete a specific routine."
          ></mino-section-header>
          <div class="product-grid optional-product-grid"></div>
        </section>

        <section class="bundle-faq" aria-labelledby="bundle-faq-heading">
          <h2 id="bundle-faq-heading">Frequently asked questions</h2>
          <div class="faq-list">
            ${faqs.map(createFaq).join("")}
          </div>
        </section>

        <section class="bundle-cta" aria-labelledby="bundle-cta-heading">
          <p class="eyebrow">Own less. Cook better.</p>
          <h2 id="bundle-cta-heading">Start with the essentials.</h2>
          <p>Review the included products and choose only what fits your routine.</p>
          <a class="hero-button" href="#included-products">${ctaLabel}</a>
        </section>
      </article>
    `;

    container.querySelector(".bundle-detail-approval").appendChild(
      global.GuidanceUI.createApprovalMark(["Mino Approved", "Essential"])
    );
    MinoValidator.setupImageFallback(container);

    const includedGrid = container.querySelector(".included-product-grid");
    safeIncludedProducts.forEach(product => {
      const card = global.ProductUI.createProductCard(product);
      if (card) includedGrid.appendChild(card);
    });

    const optionalSection = container.querySelector(".optional-products");
    if (safeOptionalProducts.length === 0) {
      optionalSection.remove();
    } else {
      const optionalGrid = container.querySelector(".optional-product-grid");
      safeOptionalProducts.slice(0, 4).forEach(product => {
        const card = global.ProductUI.createProductCard(product);
        if (card) optionalGrid.appendChild(card);
      });
    }
  }

  function createGuidanceBlock(heading, copy) {
    return `
      <article>
        <h2>${MinoValidator.escapeHtml(heading)}</h2>
        <p>${MinoValidator.escapeHtml(copy)}</p>
      </article>
    `;
  }

  function createFaq(faq) {
    const question = MinoValidator.escapeHtml(MinoValidator.safeText(faq?.question));
    const answer = MinoValidator.escapeHtml(MinoValidator.safeText(faq?.answer));

    return `
      <details>
        <summary>${question}</summary>
        <p>${answer}</p>
      </details>
    `;
  }

  global.BundleUI = Object.freeze({
    createBundleCard,
    createJourneyCard,
    renderBundleDetail
  });
})(window);
