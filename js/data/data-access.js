(function createDataAccess(global) {
  "use strict";

  const PRODUCT_SOURCE = "js/data/products.json";
  let catalogRequest;

  async function loadCatalog() {
    if (!catalogRequest) {
      catalogRequest = fetch(PRODUCT_SOURCE)
        .then(response => {
          if (!response.ok) {
            throw new Error(`Unable to load products (${response.status})`);
          }

          return response.json();
        })
        .then(normalizeCatalog)
        .catch(error => {
          catalogRequest = undefined;
          throw error;
        });
    }

    return catalogRequest;
  }

  function normalizeCatalog(source) {
    const sourceProducts = Array.isArray(source) ? source : source.products || [];
    const sourceCollections = Array.isArray(source.collections)
      ? source.collections
      : createLegacyCollections(sourceProducts);
    const collections = sourceCollections.map(collection => ({ ...collection }));
    const products = sourceProducts.map(product =>
      normalizeProduct(product, collections)
    );

    return { collections, products };
  }

  function createLegacyCollections(products) {
    const collections = new Map();

    products.forEach(product => {
      const title = product.category || product.collection?.title;
      const handle = product.collection?.handle || createHandle(title);

      if (title && !collections.has(handle)) {
        collections.set(handle, { handle, title, description: "" });
      }
    });

    return [...collections.values()];
  }

  function normalizeProduct(product, collections) {
    const handle = product.handle || createHandle(product.name);
    const collectionHandles = product.collectionHandles || [
      product.collection?.handle || createHandle(product.category)
    ];
    const collection =
      collections.find(item => item.handle === collectionHandles[0]) ||
      product.collection || {
        handle: collectionHandles[0],
        title: product.category || "Products",
        description: ""
      };

    return {
      ...product,
      handle,
      category: collection.title,
      collection: { ...collection },
      collectionHandles: [...collectionHandles],
      features: [...(product.features || [])],
      philosophy: [...(product.philosophy || [])],
      philosophyExplanation: product.philosophyExplanation || "Chosen for practical, everyday use.",
      whyChosen: product.whyChosen || product.whyItsPractical || "Chosen for practical, everyday use.",
      bestFor: product.bestFor || "Everyday kitchen routines.",
      relatedProducts: [...(product.relatedProducts || [])],
      seo: {
        title: `${product.name} | Mino Kitchens`,
        description: product.description,
        ...product.seo
      }
    };
  }

  function createHandle(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  function cloneProduct(product) {
    if (!product) {
      return null;
    }

    return {
      ...product,
      collection: { ...product.collection },
      collectionHandles: [...product.collectionHandles],
      features: [...product.features],
      philosophy: [...product.philosophy],
      relatedProducts: [...product.relatedProducts],
      seo: { ...product.seo }
    };
  }

  async function getProducts() {
    const catalog = await loadCatalog();
    return catalog.products.map(cloneProduct);
  }

  async function getProductById(id) {
    const catalog = await loadCatalog();
    return cloneProduct(
      catalog.products.find(product => String(product.id) === String(id))
    );
  }

  async function getProductByHandle(handle) {
    const catalog = await loadCatalog();
    return cloneProduct(
      catalog.products.find(product => product.handle === String(handle))
    );
  }

  async function getProductsByHandles(handles) {
    const requestedHandles = new Set(handles || []);
    const catalog = await loadCatalog();

    return catalog.products
      .filter(product => requestedHandles.has(product.handle))
      .map(cloneProduct);
  }

  async function getProductsByIds(ids) {
    const requestedIds = (ids || []).map(String);
    const catalog = await loadCatalog();

    return requestedIds
      .map(id => catalog.products.find(product => String(product.id) === id))
      .filter(Boolean)
      .map(cloneProduct);
  }

  async function getCollections() {
    const catalog = await loadCatalog();
    return catalog.collections.map(collection => ({ ...collection }));
  }

  global.StoreData = Object.freeze({
    getCollections,
    getProductByHandle,
    getProductById,
    getProducts,
    getProductsByIds,
    getProductsByHandles
  });
})(window);
