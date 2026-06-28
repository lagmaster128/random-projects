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
        .then(bundles => bundles.map(normalizeBundle))
        .catch(error => {
          bundleRequest = undefined;
          throw error;
        });
    }

    return bundleRequest;
  }

  function normalizeBundle(bundle) {
    return {
      ...bundle,
      handle: bundle.handle || createHandle(bundle.name),
      includedProducts: [...(bundle.includedProducts || [])],
      comingSoon: Boolean(bundle.comingSoon)
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
          includedProducts: [...bundle.includedProducts]
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

  global.BundleData = Object.freeze({
    getBundleByHandle,
    getBundles
  });
})(window);
