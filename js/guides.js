(async function loadGuideHub() {
  "use strict";

  const grid = document.getElementById("guide-grid");
  const playbookGrid = document.getElementById("playbook-grid");

  try {
    const guides = await GuideData.getGuides();
    const playbooks = guides.filter(guide => guide.type === "playbook");
    const standardGuides = guides.filter(guide => guide.type !== "playbook");

    playbooks.forEach(guide => playbookGrid.appendChild(GuideUI.createGuideCard(guide)));
    standardGuides.forEach(guide => grid.appendChild(GuideUI.createGuideCard(guide)));

    if (playbooks.length === 0) {
      playbookGrid.innerHTML = '<p class="catalog-message">No Kitchen Playbooks are available right now.</p>';
    }

    if (standardGuides.length === 0) {
      grid.innerHTML = '<p class="catalog-message">No practical guides are available right now.</p>';
    }
  } catch (error) {
    const message = '<p class="catalog-message">Guides could not be loaded. Please refresh the page.</p>';
    playbookGrid.innerHTML = message;
    grid.innerHTML = message;
    console.error(error);
  }
})();
