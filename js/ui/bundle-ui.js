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
        <div class="bundle-approval"></div>
        <span class="bundle-count">
          ${formatProductCount(bundle.includedProducts.length)}
        </span>
        <a
          class="secondary-button"
          href="bundle.html?handle=${encodeURIComponent(bundle.handle)}"
        >View Bundle</a>
      </div>
    `;

    card.querySelector(".bundle-approval").appendChild(
      global.GuidanceUI.createApprovalMark(["Mino Approved"])
    );

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
    container.className = "bundle-detail-page";
    container.innerHTML = `
      <article>
        <header class="bundle-detail-hero">
          <div class="bundle-detail-intro">
            <p class="eyebrow">Curated solution</p>
            <h1>${bundle.name}</h1>
            <p>${bundle.description}</p>
            <div class="bundle-detail-approval"></div>
          </div>
          <div class="bundle-detail-image image-placeholder" role="img" aria-label="${bundle.name} image placeholder"></div>
        </header>

        <section class="bundle-guidance-grid" aria-label="Bundle guidance">
          ${createGuidanceBlock("Problem this bundle solves", bundle.problemSolved)}
          ${createGuidanceBlock("Who it is for", bundle.idealFor)}
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
          <p>${bundle.whyTogether}</p>
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
            ${bundle.faqs.map(createFaq).join("")}
          </div>
        </section>

        <section class="bundle-cta" aria-labelledby="bundle-cta-heading">
          <p class="eyebrow">Own less. Cook better.</p>
          <h2 id="bundle-cta-heading">Start with the essentials.</h2>
          <p>Review the included products and choose only what fits your routine.</p>
          <a class="hero-button" href="#included-products">${bundle.ctaLabel}</a>
        </section>
      </article>
    `;

    container.querySelector(".bundle-detail-approval").appendChild(
      global.GuidanceUI.createApprovalMark(["Mino Approved", "Essential"])
    );

    const includedGrid = container.querySelector(".included-product-grid");
    includedProducts.forEach(product => {
      includedGrid.appendChild(global.ProductUI.createProductCard(product));
    });

    const optionalSection = container.querySelector(".optional-products");
    if (optionalProducts.length === 0) {
      optionalSection.remove();
    } else {
      const optionalGrid = container.querySelector(".optional-product-grid");
      optionalProducts.slice(0, 4).forEach(product => {
        optionalGrid.appendChild(global.ProductUI.createProductCard(product));
      });
    }
  }

  function createGuidanceBlock(heading, copy) {
    return `
      <article>
        <h2>${heading}</h2>
        <p>${copy}</p>
      </article>
    `;
  }

  function createFaq(faq) {
    return `
      <details>
        <summary>${faq.question}</summary>
        <p>${faq.answer}</p>
      </details>
    `;
  }

  global.BundleUI = Object.freeze({
    createBundleCard,
    createJourneyCard,
    renderBundleDetail
  });
})(window);
