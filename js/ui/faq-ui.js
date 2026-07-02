(function createFaqUI(global) {
  "use strict";

  function createFaqItem(faq) {
    const details = document.createElement("details");
    details.className = "faq-item";

    const summary = document.createElement("summary");
    summary.className = "faq-question";
    summary.textContent = MinoValidator.safeText(faq?.question, "Question");

    const answerId = `faq-answer-${MinoValidator.createSlug(faq?.id)}`;
    const answer = document.createElement("div");
    answer.id = answerId;
    answer.className = "faq-answer";
    answer.setAttribute("role", "region");
    answer.setAttribute("aria-label", `${summary.textContent} answer`);

    MinoValidator.safeArray(faq?.answer).forEach(paragraph => {
      const copy = document.createElement("p");
      copy.textContent = MinoValidator.safeText(paragraph);
      answer.appendChild(copy);
    });

    summary.setAttribute("aria-controls", answerId);
    summary.setAttribute("aria-expanded", "false");
    details.addEventListener("toggle", () => {
      summary.setAttribute("aria-expanded", String(details.open));
    });

    details.append(summary, answer);
    return details;
  }

  global.FaqUI = Object.freeze({ createFaqItem });
})(window);
