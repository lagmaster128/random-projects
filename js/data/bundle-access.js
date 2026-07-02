(function createBundleAccess(global) {
  "use strict";

  const BUNDLE_SOURCE = "data/bundles.json";
  let bundleRequest;

  async function loadBundles() {
    if (!bundleRequest) {
      bundleRequest = fetch(BUNDLE_SOURCE)
        .then(response => {
          if (!response.ok) {
            throw new Error(`Unable to load bundles (${response.status})`);
          }

          return response.json();
        })
        .then(validateBundles)
        .catch(error => {
          bundleRequest = undefined;
          throw error;
        });
    }

    return bundleRequest;
  }

  async function validateBundles(source) {
    const bundles = Array.isArray(source)
      ? source.map(normalizeBundle)
      : source;
    const products = global.StoreData
      ? await global.StoreData.getProducts()
      : null;
    const validation = MinoValidator.validateBundleCollection(
      bundles,
      products ? products.map(product => product.id) : undefined
    );

    MinoValidator.report("Bundles", validation);

    return validation.items.map(bundle => {
      const itemResult = validation.results.find(entry => entry.item === bundle);

      return {
        ...bundle,
        includedProducts: itemResult
          ? [...itemResult.validProductIds]
          : []
      };
    });
  }

  function normalizeBundle(bundle) {
    const source = bundle && typeof bundle === "object" ? bundle : {};

    return {
      ...source,
      handle: source.handle || createHandle(source.name),
      image: MinoValidator.safeImagePath(source.image),
      problemSolved: MinoValidator.safeText(source.problemSolved, source.description || ""),
      whyTogether: MinoValidator.safeText(source.whyTogether, "Selected to support the same kitchen routine."),
      ctaLabel: MinoValidator.safeText(source.ctaLabel, "Review the included products"),
      comparisonBestFor: MinoValidator.safeText(source.comparisonBestFor),
      primaryGoal: MinoValidator.safeText(source.primaryGoal),
      enables: [...MinoValidator.safeArray(source.enables)].filter(Boolean),
      includedProducts: Array.isArray(source.includedProducts)
        ? [...source.includedProducts]
        : source.includedProducts,
      optionalAdditions: [...MinoValidator.safeArray(source.optionalAdditions)],
      includedBundles: [...MinoValidator.safeArray(source.includedBundles)],
      faqs: MinoValidator.safeArray(source.faqs)
        .filter(faq => faq && typeof faq === "object")
        .map(faq => ({
          question: MinoValidator.safeText(faq.question),
          answer: MinoValidator.safeText(faq.answer)
        }))
    };
  }

  function createHandle(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  function cloneBundle(bundle) {
    return bundle
      ? {
          ...bundle,
          includedProducts: [...bundle.includedProducts],
          optionalAdditions: [...bundle.optionalAdditions],
          includedBundles: [...bundle.includedBundles],
          enables: [...bundle.enables],
          faqs: bundle.faqs.map(faq => ({ ...faq }))
        }
      : null;
  }

  async function getBundles() {
    const bundles = await loadBundles();
    return bundles.map(cloneBundle);
  }

  async function getBundleByHandle(handle) {
    const bundles = await loadBundles();
    return cloneBundle(
      bundles.find(bundle => bundle.handle === String(handle))
    );
  }

  async function getBundlesByType(type) {
    const bundles = await loadBundles();
    const requestedType = String(type || "");

    return bundles
      .filter(bundle => !requestedType || bundle.type === requestedType)
      .map(cloneBundle);
  }

  async function getProductBundleRelationships(product) {
    const source = product && typeof product === "object" ? product : {};
    const bundles = await loadBundles();
    const includedHandles = new Set(MinoValidator.safeArray(source.bundleHandles));
    const relatedHandles = new Set(
      MinoValidator.safeArray(source.worksWellInBundleHandles)
    );
    const relationships = new Map();

    bundles.forEach(bundle => {
      const isIncluded = includedHandles.has(bundle.handle) ||
        bundle.includedProducts.some(id => String(id) === String(source.id));
      const worksWell = relatedHandles.has(bundle.handle) ||
        bundle.optionalAdditions.includes(source.handle);

      if (isIncluded || worksWell) {
        relationships.set(bundle.handle, {
          bundle: cloneBundle(bundle),
          relationship: isIncluded ? "included" : "works-well"
        });
      }
    });

    const knownHandles = new Set(bundles.map(bundle => bundle.handle));
    const missingHandles = [...includedHandles, ...relatedHandles]
      .filter(handle => !knownHandles.has(handle));

    if (missingHandles.length > 0) {
      MinoValidator.report("Bundle relationships", {
        errors: [],
        warnings: missingHandles.map(handle => `Missing bundle handle: ${handle}`)
      });
    }

    return [...relationships.values()];
  }

  global.BundleData = Object.freeze({
    getBundleByHandle,
    getBundles,
    getBundlesByType,
    getProductBundleRelationships
  });
})(window);
