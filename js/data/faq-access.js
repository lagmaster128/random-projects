(function createFaqAccess(global) {
  "use strict";

  const FAQ_SOURCE = "data/faqs.json";
  let faqRequest;

  async function getFaqs() {
    if (!faqRequest) {
      faqRequest = fetch(FAQ_SOURCE)
        .then(response => {
          if (!response.ok) {
            throw new Error(`Unable to load FAQs (${response.status})`);
          }

          return response.json();
        })
        .then(normalizeFaqs)
        .catch(error => {
          faqRequest = undefined;
          throw error;
        });
    }

    return faqRequest.then(faqs => faqs.map(faq => ({
      ...faq,
      answer: [...faq.answer]
    })));
  }

  function normalizeFaqs(source) {
    if (!Array.isArray(source)) {
      MinoValidator.report("FAQs", {
        errors: ["FAQ collection must be an array"],
        warnings: []
      });
      return [];
    }

    const seenIds = new Set();
    const warnings = [];
    const faqs = source
      .filter(item => item && typeof item === "object")
      .map((item, index) => {
        const id = MinoValidator.safeText(item.id, `question-${index + 1}`).trim();
        const question = MinoValidator.safeText(item.question).trim();
        const answer = Array.isArray(item.answer)
          ? item.answer.map(value => MinoValidator.safeText(value).trim()).filter(Boolean)
          : [MinoValidator.safeText(item.answer).trim()].filter(Boolean);

        if (seenIds.has(id)) {
          warnings.push(`Duplicate FAQ ID: ${id}`);
          return null;
        }

        seenIds.add(id);
        if (!question || answer.length === 0) {
          warnings.push(`FAQ ${id} is incomplete and was omitted`);
          return null;
        }

        return { id, question, answer };
      })
      .filter(Boolean);

    MinoValidator.report("FAQs", { errors: [], warnings });
    return faqs;
  }

  global.FaqData = Object.freeze({ getFaqs });
})(window);
