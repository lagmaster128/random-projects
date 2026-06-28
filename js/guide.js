(async function loadGuidePage() {
  "use strict";

  const container = document.getElementById("guide-detail");
  const handle = new URLSearchParams(window.location.search).get("handle");

  try {
    const guide = handle ? await GuideData.getGuideByHandle(handle) : null;

    if (!guide) {
      container.innerHTML = `
        <div class="catalog-message">
          <h1>Guide not found</h1>
          <p>This guide may have moved or is still being prepared.</p>
          <a class="hero-button" href="guides.html">Browse guides</a>
        </div>
      `;
      return;
    }

    document.title = guide.seo.title;
    document.querySelector('meta[name="description"]').setAttribute("content", guide.seo.description);
    document.querySelector('link[rel="canonical"]').setAttribute(
      "href",
      new URL(`guide.html?handle=${encodeURIComponent(guide.handle)}`, window.location.href).href
    );
    GuideUI.renderGuide(container, guide);
  } catch (error) {
    container.innerHTML = '<p class="catalog-message">This guide could not be loaded. Please refresh the page.</p>';
    console.error(error);
  }
})();
