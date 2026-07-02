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
        ${image ? "" : `role="img" aria-label="${name} image placeholder"`}
      >${image ? `<img src="${image}" alt="${name}" loading="lazy" decoding="async">` : ""}</div>
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
        >See the solution</a>
      </div>
    `;

    card.querySelector(".bundle-approval").appendChild(
      global.GuidanceUI.createApprovalMark(["Purposefully paired"])
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
    direction.textContent = "See a good starting point";

    link.append(heading, description, direction);
    return link;
  }

  function formatProductCount(count) {
    return `${count} ${count === 1 ? "essential" : "essentials"} working together`;
  }

  function renderBundleComparison(container, bundles) {
    const safeBundles = MinoValidator.safeArray(bundles);

    if (!container || safeBundles.length === 0) return;

    const table = document.createElement("div");
    table.className = "bundle-comparison";
    table.setAttribute("role", "table");
    table.setAttribute("aria-label", "Compare kitchen bundles by purpose");
    table.innerHTML = `
      <div class="bundle-comparison__row bundle-comparison__header" role="row">
        <span role="columnheader">Bundle</span>
        <span role="columnheader">Best for</span>
        <span role="columnheader">Primary goal</span>
      </div>
    `;

    safeBundles.forEach(bundle => {
      const row = document.createElement("div");
      row.className = "bundle-comparison__row";
      row.setAttribute("role", "row");

      [
        bundle.name,
        bundle.comparisonBestFor || bundle.idealFor,
        bundle.primaryGoal || bundle.problemSolved
      ].forEach((value, index) => {
        const cell = document.createElement("span");
        cell.setAttribute("role", "cell");

        if (index === 0) {
          const link = document.createElement("a");
          link.href = `bundle.html?handle=${encodeURIComponent(MinoValidator.safeText(bundle.handle))}`;
          link.textContent = MinoValidator.safeText(value);
          cell.appendChild(link);
        } else {
          cell.textContent = MinoValidator.safeText(value);
        }

        row.appendChild(cell);
      });

      table.appendChild(row);
    });

    container.replaceChildren(table);
  }

  function renderBundleDetail(container, bundle, includedProducts, optionalProducts) {
    const name = MinoValidator.escapeHtml(MinoValidator.safeText(bundle?.name, "Bundle"));
    const description = MinoValidator.escapeHtml(MinoValidator.safeText(bundle?.description));
    const problemSolved = MinoValidator.safeText(bundle?.problemSolved);
    const idealFor = MinoValidator.safeText(bundle?.idealFor);
    const whyTogether = MinoValidator.escapeHtml(MinoValidator.safeText(bundle?.whyTogether));
    const ctaLabel = MinoValidator.escapeHtml(MinoValidator.safeText(bundle?.ctaLabel, "See how the solution works"));
    const image = MinoValidator.escapeHtml(MinoValidator.safeImagePath(bundle?.image));
    const faqs = MinoValidator.safeArray(bundle?.faqs);
    const safeIncludedProducts = MinoValidator.safeArray(includedProducts);
    const safeOptionalProducts = MinoValidator.safeArray(optionalProducts);

    container.className = "bundle-detail-page container";
    container.innerHTML = `
      <article>
        <header class="bundle-detail-hero">
          <div class="bundle-detail-intro">
            <p class="eyebrow">A practical place to begin</p>
            <h1>${name}</h1>
            <p>${description}</p>
            <div class="bundle-detail-approval"></div>
          </div>
          <div class="bundle-detail-image${image ? "" : " image-placeholder"}" ${image ? "" : `role="img" aria-label="${name} image placeholder"`}>${image ? `<img src="${image}" alt="${name}" decoding="async">` : ""}</div>
        </header>

        <mino-catalog-note></mino-catalog-note>

        <section class="bundle-guidance-grid" aria-label="Bundle guidance">
          ${createGuidanceBlock("Why this bundle exists", problemSolved)}
          ${createGuidanceBlock("Best for", idealFor)}
        </section>

        ${createEnablesSection(bundle?.enables)}

        <section class="bundle-rationale" aria-labelledby="bundle-rationale-heading">
          <p class="eyebrow">Why this combination works</p>
          <h2 id="bundle-rationale-heading">Why these products work together</h2>
          <p>${whyTogether}</p>
        </section>

        <section class="bundle-cta" aria-labelledby="bundle-cta-heading">
          <div>
            <p class="eyebrow">Spend less. Cook more.</p>
            <h2 id="bundle-cta-heading">See what earns a place.</h2>
            <p>If this fits your routine, look at the job each item does. Skip anything you know you won't use.</p>
          </div>
          <a class="hero-button" href="#included-products">${ctaLabel}</a>
        </section>

        <section id="included-products" class="bundle-products-section" aria-labelledby="included-products-heading">
          <mino-section-header
            heading-id="included-products-heading"
            heading="What's included—and why"
            copy="Every item has a job. Nothing is here just to make the bundle look bigger."
          ></mino-section-header>
          <div class="product-grid included-product-grid"></div>
        </section>

        <section class="bundle-products-section optional-products" aria-labelledby="optional-products-heading">
          <mino-section-header
            heading-id="optional-products-heading"
            heading="Useful later, if the need comes up"
            copy="These can help, but you don't need them to get started."
          ></mino-section-header>
          <div class="product-grid optional-product-grid"></div>
        </section>

        <section class="bundle-faq" aria-labelledby="bundle-faq-heading">
          <h2 id="bundle-faq-heading">Questions before choosing</h2>
          <div class="faq-list">
            ${faqs.map(createFaq).join("")}
          </div>
        </section>

      </article>
    `;

    container.querySelector(".bundle-detail-approval").appendChild(
      global.GuidanceUI.createApprovalMark(["Mino Approved", "Purposefully paired"])
    );
    MinoValidator.setupImageFallback(container);

    const includedGrid = container.querySelector(".included-product-grid");
    safeIncludedProducts.forEach(product => {
      const card = createBundleProductCard(product, false);
      if (card) includedGrid.appendChild(card);
    });

    const optionalSection = container.querySelector(".optional-products");
    if (safeOptionalProducts.length === 0) {
      optionalSection.remove();
    } else {
      const optionalGrid = container.querySelector(".optional-product-grid");
      safeOptionalProducts.slice(0, 4).forEach(product => {
        const card = createBundleProductCard(product, true);
        if (card) optionalGrid.appendChild(card);
      });
    }
  }

  function createBundleProductCard(product, optional) {
    const card = global.ProductUI.createProductCard(product);

    if (!card) {
      return null;
    }

    card.classList.add("bundle-product-card");
    const content = card.querySelector(".product-card-content");
    const price = content?.querySelector(".product-price");
    const note = document.createElement("p");
    note.className = "bundle-product-note";
    note.textContent = MinoValidator.safeText(
      optional ? product?.bestFor : product?.whyChosen,
      "This item handles a specific part of the routine."
    );

    if (content && price) {
      content.insertBefore(note, price);
    }

    return card;
  }

  function createGuidanceBlock(heading, copy) {
    return `
      <article>
        <h2>${MinoValidator.escapeHtml(heading)}</h2>
        <p>${MinoValidator.escapeHtml(copy)}</p>
      </article>
    `;
  }

  function createEnablesSection(values) {
    const items = MinoValidator.safeArray(values).filter(Boolean);
    if (items.length === 0) return "";

    return `
      <section class="bundle-enables" aria-labelledby="bundle-enables-heading">
        <p class="eyebrow">What this enables</p>
        <h2 id="bundle-enables-heading">What you’ll be ready to do</h2>
        <ul>${items.map(item => `<li>${MinoValidator.escapeHtml(item)}</li>`).join("")}</ul>
      </section>
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
    renderBundleComparison,
    renderBundleDetail
  });
})(window);
