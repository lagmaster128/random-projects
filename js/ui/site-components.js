(function registerSiteComponents(global) {
  "use strict";

  class SiteHeader extends HTMLElement {
    connectedCallback() {
      const currentPage = global.location.pathname.split("/").pop() || "index.html";

      ensureFavicon();

      this.innerHTML = `
        <header class="site-header">
          <nav class="navbar" aria-label="Main navigation">
            <a class="logo" href="index.html" aria-label="Mino Kitchens home">
              <img src="images/brand/mino-kitchens-logo.svg" alt="">
              <span>Mino Kitchens</span>
            </a>

            <ul class="nav-links">
              ${createNavItem("index.html", "Home", currentPage)}
              ${createNavItem("bundles.html", "Bundles", currentPage)}
              ${createNavItem("products.html", "Products", currentPage)}
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
    }
  }

  class SiteFooter extends HTMLElement {
    connectedCallback() {
      this.innerHTML = `
        <footer>
          <img class="footer-logo" src="images/brand/mino-kitchens-logo.svg" alt="Mino Kitchens">
          <p>&copy; ${new Date().getFullYear()} Mino Kitchens</p>
        </footer>
      `;
    }
  }

  function createNavItem(href, label, currentPage) {
    const isCurrent =
      currentPage === href ||
      (href === "products.html" && currentPage === "product.html") ||
      (href === "bundles.html" && currentPage === "bundle.html");
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
})(window);
