(async function loadFaqPage() {
  "use strict";

  const list = document.getElementById("faq-list");

  try {
    const faqs = await FaqData.getFaqs();

    if (faqs.length === 0) {
      list.innerHTML = '<p class="catalog-message">FAQ content is not available right now.</p>';
      return;
    }

    const fragment = document.createDocumentFragment();
    faqs.forEach(faq => fragment.appendChild(FaqUI.createFaqItem(faq)));
    list.replaceChildren(fragment);
  } catch (error) {
    list.innerHTML = '<p class="catalog-message">FAQs could not be loaded. Please refresh the page.</p>';
    console.error(error);
  }
})();
