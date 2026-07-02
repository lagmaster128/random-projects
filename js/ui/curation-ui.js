(function createCurationUI(global) {
  "use strict";

  function createMinoReview(product) {
    const review = product?.minoReview;

    if (!review || typeof review !== "object") return null;

    const hasScore = Number.isFinite(review.score);
    const hasApproval = typeof review.approved === "boolean";
    const positives = MinoValidator.safeArray(review.positives).filter(Boolean);
    const complaints = MinoValidator.safeArray(review.complaints).filter(Boolean);
    const rationale = MinoValidator.safeText(review.rationale);

    if (!hasScore && !hasApproval && !positives.length && !complaints.length && !rationale) {
      return null;
    }

    const section = document.createElement("section");
    section.className = "mino-review";
    section.setAttribute("aria-labelledby", "mino-review-heading");

    const header = document.createElement("header");
    header.className = "mino-review__header";
    header.innerHTML = `
      <div>
        <p class="eyebrow">What we looked at</p>
        <h2 id="mino-review-heading">The Mino review</h2>
      </div>
    `;

    if (hasScore) {
      const safeScore = Math.max(0, Math.min(100, review.score));
      const score = document.createElement("p");
      score.className = "mino-review__score";
      score.innerHTML = `<strong>${safeScore}</strong><span>/100</span>`;
      score.setAttribute("aria-label", `Mino score: ${safeScore} out of 100`);
      header.appendChild(score);
    }

    section.appendChild(header);

    if (hasApproval) {
      section.appendChild(
        global.GuidanceUI.createApprovalMark([
          review.approved ? "Mino Approved" : "Not Mino Approved"
        ])
      );
    }

    const details = document.createElement("div");
    details.className = "mino-review__details";
    appendList(details, "What stands out", positives);
    appendList(details, "What to know before buying", complaints);
    appendCopy(details, "Our reasoning", rationale);

    if (details.hasChildNodes()) section.appendChild(details);
    return section;
  }

  function createBundleRelationships(relationships) {
    const validRelationships = MinoValidator.safeArray(relationships)
      .filter(item => item?.bundle?.handle && item?.bundle?.name);

    if (!validRelationships.length) return null;

    const section = document.createElement("section");
    section.className = "bundle-relationships";
    section.setAttribute("aria-labelledby", "bundle-relationships-heading");
    section.innerHTML = `
      <p class="eyebrow">How it fits into the bigger plan</p>
      <h2 id="bundle-relationships-heading">You may not need to choose this on its own</h2>
      <p>This product already has a place in the bundles below. Start there if you're solving the whole kitchen problem.</p>
    `;

    const list = document.createElement("div");
    list.className = "bundle-relationships__list";

    validRelationships.forEach(({ bundle, relationship }) => {
      const link = document.createElement("a");
      link.className = "bundle-relationship";
      link.href = `bundle.html?handle=${encodeURIComponent(bundle.handle)}`;

      const label = document.createElement("span");
      label.className = "bundle-relationship__label";
      label.textContent = relationship === "included" ? "Included in" : "Works well in";

      const name = document.createElement("strong");
      name.textContent = bundle.name;
      link.append(label, name);
      list.appendChild(link);
    });

    section.appendChild(list);
    return section;
  }

  function appendList(container, heading, values) {
    if (!values.length) return;
    const block = document.createElement("div");
    const title = document.createElement("h3");
    const list = document.createElement("ul");
    title.textContent = heading;
    values.forEach(value => {
      const item = document.createElement("li");
      item.textContent = MinoValidator.safeText(value);
      list.appendChild(item);
    });
    block.append(title, list);
    container.appendChild(block);
  }

  function appendCopy(container, heading, value) {
    if (!value) return;
    const block = document.createElement("div");
    const title = document.createElement("h3");
    const copy = document.createElement("p");
    title.textContent = heading;
    copy.textContent = value;
    block.append(title, copy);
    container.appendChild(block);
  }

  global.CurationUI = Object.freeze({
    createBundleRelationships,
    createMinoReview
  });
})(window);
