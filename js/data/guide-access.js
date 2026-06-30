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
        .then(validateGuides)
        .catch(error => {
          guideRequest = undefined;
          throw error;
        });
    }

    return guideRequest;
  }

  function validateGuides(source) {
    const guides = Array.isArray(source)
      ? source.map(normalizeGuide)
      : source;
    const validation = MinoValidator.validateCollection(
      guides,
      MinoValidator.validateGuide,
      { label: "guide" }
    );

    MinoValidator.report("Guides", validation);
    return validation.items.filter(guide => guide.status === "published");
  }

  function normalizeGuide(guide) {
    const source = guide && typeof guide === "object" ? guide : {};
    const slug = source.slug || source.handle || MinoValidator.createSlug(source.title);
    const summary = source.summary || source.description || "";

    return {
      ...source,
      id: source.id || slug,
      slug,
      handle: source.handle || slug,
      summary,
      description: summary,
      heroImage: MinoValidator.safeImagePath(source.heroImage),
      status: source.status || "published",
      sections: MinoValidator.safeArray(source.sections)
        .filter(section =>
          section &&
          typeof section === "object" &&
          MinoValidator.safeText(section.heading).trim() &&
          MinoValidator.safeText(section.body).trim()
        )
        .map(section => ({
          heading: MinoValidator.safeText(section.heading),
          body: MinoValidator.safeText(section.body)
        })),
      seo: {
        title: `${MinoValidator.safeText(source.title, "Guide")} | Mino Kitchens`,
        description: summary,
        ...(source.seo && typeof source.seo === "object" ? source.seo : {})
      }
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
