(function bindCartCount(global) {
  "use strict";

  function renderCount() {
    document.querySelectorAll("#cart-count").forEach(element => {
      element.textContent = global.Cart.getCount();
    });
  }

  global.Cart.subscribe(renderCount);
})(window);
