(function registerSiteComponents(global) {
  "use strict";

  class SiteHeader extends HTMLElement {
    connectedCallback() {
      const currentPage = global.location.pathname.split("/").pop() || "index.html";

      ensureFavicon();

      this.innerHTML = `
        <a class="skip-link" href="#main-content">Skip to main content</a>
        <header class="site-header">
          <nav class="navbar" aria-label="Main navigation">
            <a class="logo" href="index.html" aria-label="Mino Kitchens home">
              <img src="images/brand/mino-kitchens-logo.svg" alt="">
              <span>Mino Kitchens</span>
            </a>

            <button
              class="nav-toggle"
              type="button"
              aria-expanded="false"
              aria-controls="primary-navigation"
            >
              <span>Menu</span>
              <span class="nav-toggle__icon" aria-hidden="true"></span>
            </button>

            <ul id="primary-navigation" class="nav-links">
              ${createNavItem("index.html", "Home", currentPage)}
              ${createNavItem("bundles.html", "Bundles", currentPage)}
              ${createNavItem("products.html", "Products", currentPage)}
              ${createNavItem("guides.html", "Guides", currentPage)}
              ${createNavItem("faq.html", "FAQ", currentPage)}
              ${createNavItem("about.html", "About", currentPage)}
              ${createNavItem("contact.html", "Contact", currentPage)}
              <li>
                <a href="cart.html"${
                  currentPage === "cart.html" ? ' aria-current="page"' : ""
                }>
                  Cart (<span id="cart-count">0</span>)
                </a>
              </li>
            </ul>
          </nav>
        </header>
      `;

      const toggle = this.querySelector(".nav-toggle");
      const navigation = this.querySelector(".nav-links");

      toggle.addEventListener("click", () => {
        const isOpen = toggle.getAttribute("aria-expanded") === "true";
        toggle.setAttribute("aria-expanded", String(!isOpen));
        navigation.classList.toggle("is-open", !isOpen);
      });

      const desktopNavigation = global.matchMedia("(min-width: 901px)");
      const resetMobileNavigation = event => {
        if (!event.matches) return;
        navigation.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      };

      desktopNavigation.addEventListener("change", resetMobileNavigation);

      this.addEventListener("keydown", event => {
        if (event.key !== "Escape" || !navigation.classList.contains("is-open")) {
          return;
        }

        navigation.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.focus();
      });

      const assignMainTarget = () => {
        const main = document.querySelector("main");
        const skipLink = this.querySelector(".skip-link");

        if (!main || !skipLink) return;
        if (!main.id) main.id = "main-content";
        skipLink.href = `#${main.id}`;
      };

      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", assignMainTarget, { once: true });
      } else {
        assignMainTarget();
      }
    }
  }

  class SiteFooter extends HTMLElement {
    connectedCallback() {
      this.innerHTML = `
        <footer>
          <div class="footer-inner">
            <div class="footer-brand">
              <img class="footer-logo" src="images/brand/mino-kitchens-logo.svg" alt="">
              <p class="footer-name">Mino Kitchens</p>
              <p>Fewer, better choices for building your first functional kitchen.</p>
            </div>
            <nav class="footer-navigation" aria-label="Footer navigation">
              <a href="bundles.html">Bundles</a>
              <a href="products.html">Essentials</a>
              <a href="guides.html">Guides</a>
              <a href="faq.html">FAQ</a>
              <a href="contact.html">Contact</a>
            </nav>
            <p class="footer-legal">&copy; ${new Date().getFullYear()} Mino Kitchens. Spend less. Cook more.</p>
          </div>
        </footer>
      `;
    }
  }

  class MinoCatalogNote extends HTMLElement {
    connectedCallback() {
      const isGuide = this.getAttribute("context") === "guide";
      const message = isGuide
        ? "Some guides mention appliances or ingredients to explain what a kitchen setup can do. They're useful context, but they aren't products in our catalog."
        : "Mino Kitchens focuses on cookware, organization, and useful everyday kitchen tools. Countertop appliances, electronics, and food ingredients aren't part of our current catalog.";

      this.innerHTML = `
        <aside class="catalog-note" aria-label="Catalog information">
          <strong>A quick note</strong>
          <p>${message}</p>
        </aside>
      `;
    }
  }

  function createNavItem(href, label, currentPage) {
    const isCurrent =
      currentPage === href ||
      (href === "products.html" && currentPage === "product.html") ||
      (href === "bundles.html" && currentPage === "bundle.html") ||
      (href === "guides.html" && currentPage === "guide.html");
    const current = isCurrent ? ' aria-current="page"' : "";
    return `<li><a href="${href}"${current}>${label}</a></li>`;
  }

  function ensureFavicon() {
    if (document.querySelector('link[rel="icon"]')) {
      return;
    }

    const favicon = document.createElement("link");
    favicon.rel = "icon";
    favicon.type = "image/svg+xml";
    favicon.href = "images/brand/mino-kitchens-logo.svg";
    document.head.appendChild(favicon);
  }

  if (!customElements.get("site-header")) {
    customElements.define("site-header", SiteHeader);
  }

  if (!customElements.get("site-footer")) {
    customElements.define("site-footer", SiteFooter);
  }

  if (!customElements.get("mino-catalog-note")) {
    customElements.define("mino-catalog-note", MinoCatalogNote);
  }
})(window);
