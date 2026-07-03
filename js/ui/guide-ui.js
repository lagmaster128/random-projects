(function createGuideUI(global) {
  "use strict";

  function createGuideCard(guide) {
    const article = document.createElement("article");
    article.className = `guide-card${guide?.type === "playbook" ? " guide-card--playbook" : ""}`;

    const eyebrow = document.createElement("p");
    eyebrow.className = "eyebrow";
    eyebrow.textContent = guide?.type === "playbook" ? "Kitchen Playbook" : "Choosing Guide";

    const heading = document.createElement("h2");
    const link = document.createElement("a");
    link.href = getGuideUrl(guide);
    link.textContent = MinoValidator.safeText(guide?.title, "Guide");
    heading.appendChild(link);

    const description = document.createElement("p");
    description.textContent = MinoValidator.safeText(guide?.description);

    const bestFor = createBestFor(guide?.bestFor);

    const direction = document.createElement("a");
    direction.className = "guide-link";
    direction.href = getGuideUrl(guide);
    direction.textContent = guide?.type === "playbook"
      ? "See what the setup needs"
      : "Read the guide";

    article.append(eyebrow, heading, description);
    if (bestFor) article.appendChild(bestFor);
    article.appendChild(direction);
    return article;
  }

  function renderGuide(container, guide) {
    const article = document.createElement("article");
    article.className = "article-layout";

    const header = document.createElement("header");
    header.className = "article-header";
    const eyebrow = document.createElement("p");
    eyebrow.className = "eyebrow";
    eyebrow.textContent = guide?.type === "playbook"
      ? "Kitchen Playbook"
      : "Before you buy";
    const title = document.createElement("h1");
    title.textContent = MinoValidator.safeText(guide?.title, "Guide");
    const summary = document.createElement("p");
    summary.textContent = MinoValidator.safeText(guide?.description);
    header.append(eyebrow, title, summary);
    const bestFor = createBestFor(guide?.bestFor);
    if (bestFor) header.appendChild(bestFor);

    const content = guide?.type === "playbook"
      ? createPlaybookContent(guide)
      : createStandardGuideContent(guide);

    const note = document.createElement("aside");
    note.className = "guide-progress-note";
    if (guide?.type === "playbook") {
      note.innerHTML = `
        <strong>This is a kitchen setup, not a recipe list.</strong>
        <p>Start with the tools that cover meals you'll really make. Upgrades can wait until the routine sticks.</p>
      `;
    } else {
      note.innerHTML = `
        <strong>Think of this as a filter, not another shopping list.</strong>
        <p>Start with your regular routines. If a need shows up later, you can solve it then.</p>
      `;
    }

    const catalogNote = document.createElement("mino-catalog-note");
    catalogNote.setAttribute("context", "guide");

    article.append(header, catalogNote, content, note);
    container.replaceChildren(article);
  }

  function createStandardGuideContent(guide) {
    const content = document.createElement("div");
    content.className = "article-content";

    const structuredSections = [
      createWhyItMatters(guide?.whyItMatters),
      createStandardListSection("Key Takeaways", guide?.keyTakeaways),
      createStandardListSection("Beginner Tips", guide?.beginnerTips),
      createStandardListSection("Common Mistakes", guide?.commonMistakes),
      createRecommendedEssentials(guide?.recommendedEssentials)
    ].filter(Boolean);

    if (structuredSections.length) {
      structuredSections.forEach(section => content.appendChild(section));
      return content;
    }

    MinoValidator.safeArray(guide?.sections).forEach(section => {
      const block = document.createElement("section");
      const heading = document.createElement("h2");
      const body = document.createElement("p");
      heading.textContent = MinoValidator.safeText(section?.heading);
      body.textContent = MinoValidator.safeText(section?.body);
      block.append(heading, body);
      content.appendChild(block);
    });

    return content;
  }

  function createWhyItMatters(paragraphs) {
    const items = MinoValidator.safeArray(paragraphs).filter(Boolean);
    if (!items.length) return null;

    const section = createStandardSection("Why It Matters");
    items.forEach(text => {
      const paragraph = document.createElement("p");
      paragraph.textContent = MinoValidator.safeText(text);
      section.appendChild(paragraph);
    });
    return section;
  }

  function createStandardListSection(title, items) {
    const values = MinoValidator.safeArray(items).filter(Boolean);
    if (!values.length) return null;

    const section = createStandardSection(title);
    const list = document.createElement("ul");
    list.className = "guide-resource-list";
    values.forEach(text => {
      const item = document.createElement("li");
      item.textContent = MinoValidator.safeText(text);
      list.appendChild(item);
    });
    section.appendChild(list);
    return section;
  }

  function createRecommendedEssentials(recommendation) {
    if (!recommendation) return null;

    const section = createStandardSection("Recommended Essentials");
    const intro = MinoValidator.safeText(recommendation.intro).trim();
    if (intro) {
      const paragraph = document.createElement("p");
      paragraph.textContent = intro;
      section.appendChild(paragraph);
    }

    if (recommendation.bundle) {
      const link = document.createElement("a");
      link.className = "guide-essential-link";
      link.href = `bundle.html?handle=${encodeURIComponent(
        MinoValidator.safeText(recommendation.bundle.handle)
      )}`;
      link.textContent = `Explore the ${MinoValidator.safeText(recommendation.bundle.name)}`;
      section.appendChild(link);
    }

    return section;
  }

  function createStandardSection(title) {
    const section = document.createElement("section");
    section.className = "guide-resource-section";
    const heading = document.createElement("h2");
    heading.textContent = title;
    section.appendChild(heading);
    return section;
  }

  function createPlaybookContent(guide) {
    const content = document.createElement("div");
    content.className = "article-content playbook-content";

    const meals = createListSection(
      "What this setup helps you make",
      "Representative meals, not recipes. The point is capability: one small setup can support many everyday options.",
      MinoValidator.safeArray(guide?.mealsEnabled)
    );

    const essentials = createToolSection(
      "Essential tools",
      "The small foundation that supports most meals in this category.",
      MinoValidator.safeArray(guide?.essentialTools)
    );

    const optional = createToolSection(
      "Optional upgrades",
      "Helpful additions once the routine is real, not items you need before getting started.",
      MinoValidator.safeArray(guide?.optionalTools)
    );

    const bundle = createBundleSection(guide?.supportingBundle);
    const takeaway = createTakeaway(guide?.takeaway);

    [meals, essentials, optional, bundle, takeaway]
      .filter(Boolean)
      .forEach(section => content.appendChild(section));

    return content;
  }

  function createListSection(title, intro, items) {
    if (!items.length) {
      return null;
    }

    const section = createPlaybookSection(title, intro);
    const list = document.createElement("ul");
    list.className = "playbook-list";
    items.forEach(item => {
      const listItem = document.createElement("li");
      listItem.textContent = MinoValidator.safeText(item);
      list.appendChild(listItem);
    });

    section.appendChild(list);
    return section;
  }

  function createToolSection(title, intro, tools) {
    if (!tools.length) {
      return null;
    }

    const section = createPlaybookSection(title, intro);
    const grid = document.createElement("div");
    grid.className = "playbook-tool-grid";

    tools.forEach(tool => {
      const card = document.createElement("article");
      card.className = "playbook-tool";

      const heading = document.createElement("h3");
      heading.textContent = MinoValidator.safeText(tool?.name);
      const reason = document.createElement("p");
      reason.textContent = MinoValidator.safeText(tool?.reason);

      card.append(heading, reason);
      grid.appendChild(card);
    });

    section.appendChild(grid);
    return section;
  }

  function createBundleSection(bundle) {
    if (!bundle) {
      return null;
    }

    const section = createPlaybookSection(
      "Best supporting Mino bundle",
      "A natural place to start if this is the kind of kitchen capability you want to build."
    );

    const card = document.createElement("a");
    card.className = "playbook-bundle-card";
    card.href = `bundle.html?handle=${encodeURIComponent(MinoValidator.safeText(bundle.handle))}`;

    const eyebrow = document.createElement("span");
    eyebrow.className = "playbook-bundle-card__label";
    eyebrow.textContent = "Recommended starting point";
    const name = document.createElement("strong");
    name.textContent = MinoValidator.safeText(bundle.name);
    const rationale = document.createElement("p");
    rationale.textContent = MinoValidator.safeText(bundle.rationale);

    card.append(eyebrow, name, rationale);
    section.appendChild(card);
    return section;
  }

  function createTakeaway(takeaway) {
    const text = MinoValidator.safeText(takeaway).trim();

    if (!text) {
      return null;
    }

    const aside = document.createElement("aside");
    aside.className = "playbook-takeaway";
    const label = document.createElement("strong");
    label.textContent = "Mino takeaway";
    const body = document.createElement("p");
    body.textContent = text;
    aside.append(label, body);
    return aside;
  }

  function createPlaybookSection(title, intro) {
    const section = document.createElement("section");
    section.className = "playbook-section";
    const heading = document.createElement("h2");
    heading.textContent = title;
    const body = document.createElement("p");
    body.textContent = intro;
    section.append(heading, body);
    return section;
  }

  function createBestFor(values) {
    const items = MinoValidator.safeArray(values).filter(Boolean);
    if (items.length === 0) return null;

    const container = document.createElement("p");
    container.className = "best-for-line";
    const label = document.createElement("strong");
    label.textContent = "Best for";
    const text = document.createElement("span");
    text.textContent = items.join(" · ");
    container.append(label, text);
    return container;
  }

  function getGuideUrl(guide) {
    return `guide.html?handle=${encodeURIComponent(MinoValidator.safeText(guide?.handle))}`;
  }

  global.GuideUI = Object.freeze({
    createGuideCard,
    getGuideUrl,
    renderGuide
  });
})(window);
