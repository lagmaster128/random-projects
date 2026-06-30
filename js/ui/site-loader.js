(function initializeSiteLoader(global) {
  "use strict";

  const root = document.documentElement;
  const storageKey = "mino-intro-seen";
  const transitionKey = "mino-page-transition";
  let shouldShow = false;
  let isIncomingTransition = false;

  try {
    shouldShow = global.sessionStorage.getItem(storageKey) !== "true";
    if (shouldShow) global.sessionStorage.setItem(storageKey, "true");
    isIncomingTransition = global.sessionStorage.getItem(transitionKey) === "true";
    global.sessionStorage.removeItem(transitionKey);
  } catch (error) {
    shouldShow = false;
  }

  if (global.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
    shouldShow = false;
    isIncomingTransition = false;
  }

  if (shouldShow) {
    root.classList.add("mino-loading");
  } else if (isIncomingTransition) {
    root.classList.add("mino-transitioning");
  }

  function createOverlay(mode) {
    const loader = document.createElement("div");
    loader.className = `site-loader site-loader--${mode}`;
    loader.setAttribute("aria-hidden", "true");
    loader.innerHTML = `
      <div class="site-loader__mark">
        <img class="site-loader__logo" src="images/brand/mino-kitchens-logo.svg" alt="">
        <span class="site-loader__name">Mino Kitchens</span>
      </div>
    `;
    return loader;
  }

  document.addEventListener("DOMContentLoaded", () => {
    if (!shouldShow && !isIncomingTransition) {
      root.classList.add("page-ready");
    } else if (isIncomingTransition) {
      const transition = createOverlay("transition");
      document.body.appendChild(transition);

      global.requestAnimationFrame(() => {
        root.classList.remove("mino-transitioning");
        root.classList.add("page-ready");
        transition.classList.add("is-leaving");
      });

      global.setTimeout(() => transition.remove(), 540);
    } else {
      const loader = createOverlay("intro");
      document.body.appendChild(loader);

      global.setTimeout(() => {
        root.classList.remove("mino-loading");
        root.classList.add("page-ready");
        loader.classList.add("is-leaving");
      }, 2500);

      global.setTimeout(() => loader.remove(), 3020);
    }

    document.addEventListener("click", event => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey ||
          event.shiftKey || event.altKey) return;

      const link = event.target instanceof Element
        ? event.target.closest("a[href]")
        : null;
      if (!link || link.target || link.hasAttribute("download")) return;

      const destination = new URL(link.href, global.location.href);
      const sameDocument = destination.pathname === global.location.pathname &&
        destination.search === global.location.search;

      if (destination.origin !== global.location.origin || sameDocument ||
          !["http:", "https:", "file:"].includes(destination.protocol)) return;

      event.preventDefault();
      const transition = createOverlay("transition");
      transition.classList.add("is-entering");
      document.body.appendChild(transition);

      try {
        global.sessionStorage.setItem(transitionKey, "true");
      } catch (error) {
        // Navigation still proceeds when storage is unavailable.
      }

      global.setTimeout(() => global.location.assign(destination.href), 520);
    });
  }, { once: true });
})(window);
