(function createGuideUI(global) {
  "use strict";

  function createGuideCard(guide) {
    const article = document.createElement("article");
    article.className = "guide-card";

    const heading = document.createElement("h2");
    const link = document.createElement("a");
    link.href = getGuideUrl(guide);
    link.textContent = guide.title;
    heading.appendChild(link);

    const description = document.createElement("p");
    description.textContent = guide.description;

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
    header.innerHTML = `
      <p class="eyebrow">Mino Kitchens guide</p>
      <h1>${guide.title}</h1>
      <p>${guide.description}</p>
    `;

    const content = document.createElement("div");
    content.className = "article-content";
    guide.sections.forEach(section => {
      const block = document.createElement("section");
      const heading = document.createElement("h2");
      const body = document.createElement("p");
      heading.textContent = section.heading;
      body.textContent = section.body;
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
    return `guide.html?handle=${encodeURIComponent(guide.handle)}`;
  }

  global.GuideUI = Object.freeze({
    createGuideCard,
    getGuideUrl,
    renderGuide
  });
})(window);
