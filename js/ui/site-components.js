(function registerSiteComponents(global) {
  "use strict";

  class SiteHeader extends HTMLElement {
    connectedCallback() {
      const currentPage = global.location.pathname.split("/").pop() || "index.html";

      this.innerHTML = `
        <header class="site-header">
          <nav class="navbar" aria-label="Main navigation">
            <a class="logo" href="index.html" aria-label="Mino Kitchens home">
              Mino Kitchens
            </a>

            <ul class="nav-links">
              ${createNavItem("index.html", "Home", currentPage)}
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
          <p>&copy; ${new Date().getFullYear()} Mino Kitchens</p>
        </footer>
      `;
    }
  }

  function createNavItem(href, label, currentPage) {
    const isCurrent =
      currentPage === href ||
      (href === "products.html" && currentPage === "product.html");
    const current = isCurrent ? ' aria-current="page"' : "";
    return `<li><a href="${href}"${current}>${label}</a></li>`;
  }

  if (!customElements.get("site-header")) {
    customElements.define("site-header", SiteHeader);
  }

  if (!customElements.get("site-footer")) {
    customElements.define("site-footer", SiteFooter);
  }
})(window);
