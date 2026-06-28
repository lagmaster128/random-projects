(async function loadGuideHub() {
  "use strict";

  const grid = document.getElementById("guide-grid");

  try {
    const guides = await GuideData.getGuides();
    guides.forEach(guide => grid.appendChild(GuideUI.createGuideCard(guide)));
  } catch (error) {
    grid.innerHTML = '<p class="catalog-message">Guides could not be loaded. Please refresh the page.</p>';
    console.error(error);
  }
})();
