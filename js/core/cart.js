(function createCartEngine(global) {
  "use strict";

  // Shopify transition seam: keep this public API and replace the localStorage
  // implementation with Shopify's Ajax Cart API when the theme migration begins.

  const STORAGE_KEY = "cart";
  const subscribers = new Set();
  let items = readStoredItems();

  function readStoredItems() {
    try {
      const storedItems = JSON.parse(localStorage.getItem(STORAGE_KEY));

      if (!Array.isArray(storedItems)) {
        return [];
      }

      return storedItems
        .map(normalizeItem)
        .filter(Boolean);
    } catch (error) {
      console.warn("The saved cart was invalid and has been reset.", error);
      localStorage.removeItem(STORAGE_KEY);
      return [];
    }
  }

  function normalizeItem(item) {
    const price = Number(item?.price);
    const quantity = Math.floor(Number(item?.quantity));

    if (
      item?.id === undefined ||
      typeof item?.name !== "string" ||
      !Number.isFinite(price) ||
      price < 0 ||
      !Number.isFinite(quantity) ||
      quantity <= 0
    ) {
      return null;
    }

    return {
      id: item.id,
      handle: typeof item.handle === "string" ? item.handle : "",
      variantId: item.variantId || item.shopify?.variantId || null,
      lineKey: item.lineKey || null,
      name: item.name.trim(),
      image: typeof item.image === "string" ? item.image : "",
      price,
      quantity
    };
  }

  function snapshot() {
    return items.map(item => ({ ...item }));
  }

  function saveAndNotify() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    notify();
  }

  function notify() {
    const currentItems = snapshot();
    subscribers.forEach(subscriber => subscriber(currentItems));
  }

  function findItemIndex(id) {
    return items.findIndex(item => getItemIdentity(item) === String(id));
  }

  function getItemIdentity(item) {
    // Shopify uses a line key when available because one variant can appear in
    // multiple cart lines with different properties.
    return String(item.lineKey || item.variantId || item.shopify?.variantId || item.id);
  }

  function addItem(product, quantity = 1) {
    const amount = Math.max(1, Math.floor(Number(quantity) || 1));
    const index = findItemIndex(getItemIdentity(product));

    if (index >= 0) {
      items[index].quantity += amount;
    } else {
      const newItem = normalizeItem({
        ...product,
        quantity: amount
      });

      if (!newItem) {
        throw new TypeError("Cannot add an invalid product to the cart.");
      }

      items.push(newItem);
    }

    saveAndNotify();
  }

  function removeItem(id) {
    const nextItems = items.filter(item => getItemIdentity(item) !== String(id));

    if (nextItems.length === items.length) {
      return;
    }

    items = nextItems;
    saveAndNotify();
  }

  function setQuantity(id, quantity) {
    const index = findItemIndex(id);

    if (index < 0) {
      return;
    }

    const nextQuantity = Math.floor(Number(quantity));

    if (!Number.isFinite(nextQuantity) || nextQuantity <= 0) {
      removeItem(id);
      return;
    }

    items[index].quantity = nextQuantity;
    saveAndNotify();
  }

  function updateQuantity(id, delta) {
    const index = findItemIndex(id);
    const amount = Number(delta);

    if (index < 0 || !Number.isFinite(amount) || amount === 0) {
      return;
    }

    setQuantity(id, items[index].quantity + amount);
  }

  function clear() {
    if (items.length === 0) {
      return;
    }

    items = [];
    saveAndNotify();
  }

  function getCount() {
    return items.reduce((count, item) => count + item.quantity, 0);
  }

  function getSubtotal() {
    return items.reduce(
      (subtotal, item) => subtotal + item.price * item.quantity,
      0
    );
  }

  function subscribe(subscriber) {
    subscribers.add(subscriber);
    subscriber(snapshot());

    return () => subscribers.delete(subscriber);
  }

  global.addEventListener("storage", event => {
    if (event.key !== STORAGE_KEY) {
      return;
    }

    items = readStoredItems();
    notify();
  });

  global.Cart = Object.freeze({
    addItem,
    clear,
    getCount,
    getItemIdentity,
    getItems: snapshot,
    getSubtotal,
    removeItem,
    setQuantity,
    subscribe,
    updateQuantity
  });
})(window);
