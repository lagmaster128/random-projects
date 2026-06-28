(function createDataAccess(global) {
  "use strict";

  const PRODUCT_SOURCE = "js/data/products.json";
  let productRequest;

  async function loadProducts() {
    if (!productRequest) {
      productRequest = fetch(PRODUCT_SOURCE)
        .then(response => {
          if (!response.ok) {
            throw new Error(`Unable to load products (${response.status})`);
          }

          return response.json();
        })
        .then(products => products.map(normalizeProduct))
        .catch(error => {
          productRequest = undefined;
          throw error;
        });
    }

    return productRequest;
  }

  function normalizeProduct(product) {
    const handle = product.handle || createHandle(product.name);
    const collection = product.collection || {
      handle: createHandle(product.category),
      title: product.category
    };

    return {
      ...product,
      handle,
      collection,
      seo: {
        title: `${product.name} | Kitchen Shop`,
        description: product.description,
        ...product.seo
      }
    };
  }

  function createHandle(value) {
    return String(value)
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
      features: [...product.features],
      seo: { ...product.seo }
    };
  }

  async function getProducts() {
    const products = await loadProducts();
    return products.map(cloneProduct);
  }

  async function getProductById(id) {
    const products = await loadProducts();
    return cloneProduct(
      products.find(product => String(product.id) === String(id))
    );
  }

  async function getProductByHandle(handle) {
    const products = await loadProducts();
    return cloneProduct(
      products.find(product => product.handle === String(handle))
    );
  }

  async function getCollections() {
    const products = await loadProducts();
    const collections = new Map();

    products.forEach(product => {
      if (!collections.has(product.collection.handle)) {
        collections.set(product.collection.handle, {
          ...product.collection
        });
      }
    });

    return [...collections.values()];
  }

  global.StoreData = Object.freeze({
    getCollections,
    getProductByHandle,
    getProductById,
    getProducts
  });
})(window);
