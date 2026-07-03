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
    const type = source.type === "playbook" ? "playbook" : "guide";

    return {
      ...source,
      type,
      id: source.id || slug,
      slug,
      handle: source.handle || slug,
      summary,
      description: summary,
      bestFor: normalizeTextList(source.bestFor),
      whyItMatters: normalizeTextList(source.whyItMatters),
      keyTakeaways: normalizeTextList(source.keyTakeaways),
      beginnerTips: normalizeTextList(source.beginnerTips),
      commonMistakes: normalizeTextList(source.commonMistakes),
      recommendedEssentials: normalizeRecommendedEssentials(source.recommendedEssentials),
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
      mealsEnabled: normalizeTextList(source.mealsEnabled),
      essentialTools: normalizeToolList(source.essentialTools),
      optionalTools: normalizeToolList(source.optionalTools),
      supportingBundle: normalizeSupportingBundle(source.supportingBundle),
      takeaway: MinoValidator.safeText(source.takeaway),
      seo: {
        title: `${MinoValidator.safeText(source.title, "Guide")} | Mino Kitchens`,
        description: summary,
        ...(source.seo && typeof source.seo === "object" ? source.seo : {})
      }
    };
  }

  function normalizeTextList(items) {
    return MinoValidator.safeArray(items)
      .map(item => MinoValidator.safeText(item).trim())
      .filter(Boolean);
  }

  function normalizeToolList(items) {
    return MinoValidator.safeArray(items)
      .filter(item => item && typeof item === "object")
      .map(item => ({
        name: MinoValidator.safeText(item.name).trim(),
        reason: MinoValidator.safeText(item.reason).trim()
      }))
      .filter(item => item.name && item.reason);
  }

  function normalizeSupportingBundle(bundle) {
    if (!bundle || typeof bundle !== "object") {
      return null;
    }

    const handle = MinoValidator.safeText(bundle.handle).trim();
    const name = MinoValidator.safeText(bundle.name).trim();
    const rationale = MinoValidator.safeText(bundle.rationale).trim();

    return handle && name
      ? { handle, name, rationale }
      : null;
  }

  function normalizeRecommendedEssentials(recommendation) {
    if (!recommendation || typeof recommendation !== "object") {
      return null;
    }

    const intro = MinoValidator.safeText(recommendation.intro).trim();
    const bundle = normalizeSupportingBundle(recommendation.bundle);

    return intro || bundle ? { intro, bundle } : null;
  }

  function cloneGuide(guide) {
    return guide
      ? {
          ...guide,
          sections: guide.sections.map(section => ({ ...section })),
          bestFor: guide.bestFor.map(value => value),
          whyItMatters: guide.whyItMatters.map(value => value),
          keyTakeaways: guide.keyTakeaways.map(value => value),
          beginnerTips: guide.beginnerTips.map(value => value),
          commonMistakes: guide.commonMistakes.map(value => value),
          recommendedEssentials: guide.recommendedEssentials
            ? {
                ...guide.recommendedEssentials,
                bundle: guide.recommendedEssentials.bundle
                  ? { ...guide.recommendedEssentials.bundle }
                  : null
              }
            : null,
          mealsEnabled: guide.mealsEnabled.map(meal => meal),
          essentialTools: guide.essentialTools.map(tool => ({ ...tool })),
          optionalTools: guide.optionalTools.map(tool => ({ ...tool })),
          supportingBundle: guide.supportingBundle ? { ...guide.supportingBundle } : null,
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
