(function createGuideUI(global) {
  "use strict";

  function createGuideCard(guide) {
    const article = document.createElement("article");
    article.className = "guide-card";

    const heading = document.createElement("h2");
    const link = document.createElement("a");
    link.href = getGuideUrl(guide);
    link.textContent = MinoValidator.safeText(guide?.title, "Guide");
    heading.appendChild(link);

    const description = document.createElement("p");
    description.textContent = MinoValidator.safeText(guide?.description);

    const direction = document.createElement("a");
    direction.className = "guide-link";
    direction.href = getGuideUrl(guide);
    direction.textContent = "Open guide";

    article.append(heading, description, direction);
    return article;
  }

  function renderGuide(container, guide) {
    const article = document.createElement("article");
    article.className = "article-layout";

    const header = document.createElement("header");
    header.className = "article-header";
    const eyebrow = document.createElement("p");
    eyebrow.className = "eyebrow";
    eyebrow.textContent = "Mino Kitchens guide";
    const title = document.createElement("h1");
    title.textContent = MinoValidator.safeText(guide?.title, "Guide");
    const summary = document.createElement("p");
    summary.textContent = MinoValidator.safeText(guide?.description);
    header.append(eyebrow, title, summary);

    const content = document.createElement("div");
    content.className = "article-content";
    MinoValidator.safeArray(guide?.sections).forEach(section => {
      const block = document.createElement("section");
      const heading = document.createElement("h2");
      const body = document.createElement("p");
      heading.textContent = MinoValidator.safeText(section?.heading);
      body.textContent = MinoValidator.safeText(section?.body);
      block.append(heading, body);
      content.appendChild(block);
    });

    const note = document.createElement("aside");
    note.className = "guide-progress-note";
    note.innerHTML = `
      <strong>More guidance is on the way.</strong>
      <p>This page is structured for future checklists, examples, and practical references.</p>
    `;

    article.append(header, content, note);
    container.replaceChildren(article);
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
