(function createGuideAccess(global) {
  "use strict";

  const GUIDE_SOURCE = "data/guides.json";
  let guideRequest;

  async function loadGuides() {
    if (!guideRequest) {
      guideRequest = fetch(GUIDE_SOURCE)
        .then(response => {
          if (!response.ok) {
            throw new Error(`Unable to load guides (${response.status})`);
          }

          return response.json();
        })
        .then(guides => guides.map(normalizeGuide))
        .catch(error => {
          guideRequest = undefined;
          throw error;
        });
    }

    return guideRequest;
  }

  function normalizeGuide(guide) {
    return {
      ...guide,
      sections: (guide.sections || []).map(section => ({ ...section })),
      seo: { ...guide.seo }
    };
  }

  function cloneGuide(guide) {
    return guide
      ? {
          ...guide,
          sections: guide.sections.map(section => ({ ...section })),
          seo: { ...guide.seo }
        }
      : null;
  }

  async function getGuides() {
    const guides = await loadGuides();
    return guides.map(cloneGuide);
  }

  async function getGuideByHandle(handle) {
    const guides = await loadGuides();
    return cloneGuide(guides.find(guide => guide.handle === String(handle)));
  }

  global.GuideData = Object.freeze({
    getGuideByHandle,
    getGuides
  });
})(window);
