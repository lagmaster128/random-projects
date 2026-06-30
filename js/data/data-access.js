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
    const sourceRecord = source && typeof source === "object" ? source : {};
    const sourceProducts = Array.isArray(source)
      ? source
      : MinoValidator.safeArray(sourceRecord.products);

    if (!Array.isArray(source) && !Array.isArray(sourceRecord.products)) {
      MinoValidator.report("Products", {
        errors: ["Product collection must be an array"],
        warnings: []
      });
    }
    const sourceCollections = Array.isArray(sourceRecord.collections)
      ? sourceRecord.collections
      : createLegacyCollections(sourceProducts);
    const collections = sourceCollections
      .filter(collection => collection && typeof collection === "object")
      .map(collection => ({
        ...collection,
        handle: MinoValidator.safeText(collection.handle),
        title: MinoValidator.safeText(collection.title),
        description: MinoValidator.safeText(collection.description)
      }))
      .filter(collection => collection.handle && collection.title);
    const products = sourceProducts.map(product =>
      normalizeProduct(product, collections)
    );
    const validation = MinoValidator.validateCollection(
      products,
      MinoValidator.validateProduct,
      { label: "product" }
    );

    MinoValidator.report("Products", validation);

    return { collections, products: validation.items };
  }

  function createLegacyCollections(products) {
    const collections = new Map();

    products.forEach(product => {
      if (!product || typeof product !== "object") {
        return;
      }

      const title = product.category || product.collection?.title;
      const handle = product.collection?.handle || createHandle(title);

      if (title && !collections.has(handle)) {
        collections.set(handle, { handle, title, description: "" });
      }
    });

    return [...collections.values()];
  }

  function normalizeProduct(product, collections) {
    const source = product && typeof product === "object" ? product : {};
    const legacyCollection = source.collection && typeof source.collection === "object"
      ? source.collection
      : null;
    const handle = source.handle || createHandle(source.name);
    const collectionHandles = Array.isArray(source.collectionHandles)
      ? source.collectionHandles.filter(Boolean)
      : [legacyCollection?.handle || createHandle(source.category)].filter(Boolean);
    const collection =
      collections.find(item => item.handle === collectionHandles[0]) ||
      legacyCollection || {
        handle: collectionHandles[0],
        title: source.category || "",
        description: ""
      };

    return {
      ...source,
      handle,
      category: MinoValidator.safeText(collection.title || source.category),
      collection: { ...collection },
      collectionHandles: [...collectionHandles],
      features: [...MinoValidator.safeArray(source.features)],
      philosophy: Array.isArray(source.philosophy)
        ? [...source.philosophy]
        : source.philosophy,
      philosophyExplanation: source.philosophyExplanation || "Chosen for practical, everyday use.",
      problemSolved: MinoValidator.safeText(source.problemSolved, "Practical everyday use."),
      whyChosen: source.whyChosen || source.whyItsPractical || "Chosen for practical, everyday use.",
      spaceSaving: MinoValidator.safeText(source.spaceSaving, "Designed for a considered kitchen setup."),
      easyToClean: MinoValidator.safeText(source.easyToClean, "Follow the product care instructions."),
      bestFor: source.bestFor || "Everyday kitchen routines.",
      relatedProducts: [...MinoValidator.safeArray(source.relatedProducts)],
      seo: {
        title: `${MinoValidator.safeText(source.name, "Product")} | Mino Kitchens`,
        description: MinoValidator.safeText(source.description),
        ...(source.seo && typeof source.seo === "object" ? source.seo : {})
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
    const requestedValues = MinoValidator.safeArray(handles).filter(Boolean);
    const requestedHandles = new Set(requestedValues);
    const catalog = await loadCatalog();
    const products = catalog.products
      .filter(product => requestedHandles.has(product.handle))
      .map(cloneProduct);
    const foundHandles = new Set(products.map(product => product.handle));
    const missing = requestedValues.filter(handle => !foundHandles.has(handle));

    if (missing.length > 0) {
      MinoValidator.report("Product references", {
        errors: [],
        warnings: missing.map(handle => `Missing product handle: ${handle}`)
      });
    }

    return products;
  }

  async function getProductsByIds(ids) {
    const requestedIds = MinoValidator.safeArray(ids).map(String);
    const catalog = await loadCatalog();
    const products = requestedIds
      .map(id => catalog.products.find(product => String(product.id) === id))
      .filter(Boolean)
      .map(cloneProduct);
    const foundIds = new Set(products.map(product => String(product.id)));
    const missing = requestedIds.filter(id => !foundIds.has(id));

    if (missing.length > 0) {
      MinoValidator.report("Product references", {
        errors: [],
        warnings: missing.map(id => `Missing product reference: ${id}`)
      });
    }

    return products;
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
