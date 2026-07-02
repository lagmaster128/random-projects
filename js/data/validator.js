(function createMinoValidator(global) {
  "use strict";

  const PREFIX = "[Mino Validator]";
  const PHILOSOPHY_VALUES = Object.freeze([
    "essential",
    "multipurpose",
    "spacesaving"
  ]);
  const GUIDE_STATUSES = Object.freeze(["draft", "published", "archived"]);

  function createResult(errors = [], warnings = [], extra = {}) {
    return { valid: errors.length === 0, errors, warnings, ...extra };
  }

  function isRecord(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
  }

  function hasText(value) {
    return typeof value === "string" && value.trim().length > 0;
  }

  function hasId(value) {
    return (typeof value === "string" || typeof value === "number") &&
      String(value).trim().length > 0;
  }

  function requireText(item, field, errors) {
    if (!hasText(item[field])) {
      errors.push(`Missing or empty required field: ${field}`);
    }
  }

  function validateProduct(product) {
    const errors = [];
    const warnings = [];

    if (!isRecord(product)) {
      return createResult(["Product must be an object"], warnings);
    }

    if (!hasId(product.id)) {
      errors.push("Missing or empty required field: id");
    }

    if (!hasText(product.handle)) {
      warnings.push("Missing Shopify-ready handle; one will be generated from the product name");
    } else if (createSlug(product.handle) !== product.handle) {
      warnings.push("Product handle should use lowercase letters, numbers, and hyphens");
    }

    ["name", "description", "image", "category"].forEach(field =>
      requireText(product, field, errors)
    );

    if (hasText(product.image) && !isSafeImagePath(product.image)) {
      errors.push("Image path must be a relative path or an HTTP(S) URL");
    }

    if (typeof product.price !== "number" || !Number.isFinite(product.price)) {
      errors.push("Price must be a finite number");
    } else if (product.price < 0) {
      errors.push("Price cannot be negative");
    }

    if (!Array.isArray(product.philosophy)) {
      errors.push("Philosophy must be an array");
    } else {
      const unsupported = product.philosophy.filter(
        value => !PHILOSOPHY_VALUES.includes(value)
      );

      if (unsupported.length > 0) {
        errors.push(`Unsupported philosophy values: ${unsupported.join(", ")}`);
      }

      if (product.philosophy.length === 0) {
        warnings.push("Philosophy is empty");
      }
    }

    [
      "features",
      "relatedProducts",
      "collectionHandles",
      "bundleHandles",
      "worksWellInBundleHandles"
    ].forEach(field => {
      if (product[field] !== undefined && !Array.isArray(product[field])) {
        warnings.push(`${field} should be an array; an empty array will be used`);
      }
    });

    if (!hasText(product.philosophyExplanation)) {
      warnings.push("Missing optional field: philosophyExplanation");
    }

    if (product.shopify !== undefined) {
      if (!isRecord(product.shopify)) {
        warnings.push("shopify should be an object when migration identifiers are added");
      } else if (product.shopify.variantId !== undefined &&
                 !hasId(product.shopify.variantId)) {
        warnings.push("shopify.variantId must be a non-empty Shopify variant ID");
      }
    }

    if (product.minoReview !== null && product.minoReview !== undefined) {
      if (!isRecord(product.minoReview)) {
        warnings.push("minoReview should be an object; the review will be hidden");
      } else {
        const score = product.minoReview.score;
        if (score !== null && score !== undefined &&
            (typeof score !== "number" || !Number.isFinite(score) ||
             score < 0 || score > 100)) {
          warnings.push("minoReview.score should be a number from 0 to 100");
        }

        ["positives", "complaints"].forEach(field => {
          if (product.minoReview[field] !== undefined &&
              !Array.isArray(product.minoReview[field])) {
            warnings.push(`minoReview.${field} should be an array`);
          }
        });
      }
    }

    return createResult(errors, warnings);
  }

  function validateBundle(bundle, context = {}) {
    const errors = [];
    const warnings = [];

    if (!isRecord(bundle)) {
      return createResult(["Bundle must be an object"], warnings);
    }

    if (!hasId(bundle.id)) {
      errors.push("Missing or empty required field: id");
    }

    ["name", "description", "idealFor"].forEach(field =>
      requireText(bundle, field, errors)
    );

    if (!Array.isArray(bundle.includedProducts)) {
      errors.push("includedProducts must be an array");
    }

    if (!hasText(bundle.image)) {
      warnings.push("Missing image path; the bundle placeholder will be used");
    } else if (!isSafeImagePath(bundle.image)) {
      warnings.push("Invalid image path; the bundle placeholder will be used");
    }

    const productIds = toIdSet(context.productIds);
    const validProductIds = [];

    if (Array.isArray(bundle.includedProducts)) {
      bundle.includedProducts.forEach(id => {
        if (!hasId(id)) {
          warnings.push("includedProducts contains an empty product reference");
        } else if (productIds && !productIds.has(String(id))) {
          warnings.push(`Missing product reference: ${id}`);
        } else {
          validProductIds.push(id);
        }
      });

      if (bundle.includedProducts.length === 0) {
        warnings.push("includedProducts is empty");
      }
    }

    ["optionalAdditions", "faqs", "includedBundles", "enables"].forEach(field => {
      if (bundle[field] !== undefined && !Array.isArray(bundle[field])) {
        warnings.push(`${field} should be an array; an empty array will be used`);
      }
    });

    return createResult(errors, warnings, { validProductIds });
  }

  function validateGuide(guide) {
    const errors = [];
    const warnings = [];

    if (!isRecord(guide)) {
      return createResult(["Guide must be an object"], warnings);
    }

    if (!hasId(guide.id)) {
      errors.push("Missing or empty required field: id");
    }

    ["title", "slug", "summary", "status"].forEach(field =>
      requireText(guide, field, errors)
    );

    if (hasText(guide.status) && !GUIDE_STATUSES.includes(guide.status)) {
      errors.push(`Unsupported guide status: ${guide.status}`);
    }

    if (!hasText(guide.heroImage)) {
      warnings.push("Missing optional field: heroImage");
    } else if (!isSafeImagePath(guide.heroImage)) {
      warnings.push("Invalid heroImage path; the guide placeholder will be used");
    }

    if (guide.type !== undefined && !["guide", "playbook"].includes(guide.type)) {
      warnings.push(`Unsupported guide type: ${guide.type}; the standard guide template will be used`);
    }

    if (guide.bestFor !== undefined && !Array.isArray(guide.bestFor)) {
      warnings.push("bestFor should be an array; the label will be hidden");
    }

    if (guide.type === "playbook") {
      validatePlaybookGuide(guide, warnings);
    } else if (guide.sections !== undefined && !Array.isArray(guide.sections)) {
      warnings.push("sections should be an array; an empty array will be used");
    } else if (!guide.sections || guide.sections.length === 0) {
      warnings.push("Guide has no content sections");
    } else {
      guide.sections.forEach((section, index) => {
        if (!isRecord(section) || !hasText(section.heading) || !hasText(section.body)) {
          warnings.push(`Section ${index + 1} is incomplete and will be omitted`);
        }
      });
    }

    return createResult(errors, warnings);
  }

  function validatePlaybookGuide(guide, warnings) {
    [
      ["mealsEnabled", "Playbook has no representative meals"],
      ["essentialTools", "Playbook has no essential tools"],
      ["optionalTools", "Playbook has no optional tools"]
    ].forEach(([field, message]) => {
      if (guide[field] !== undefined && !Array.isArray(guide[field])) {
        warnings.push(`${field} should be an array; an empty array will be used`);
      } else if (!guide[field] || guide[field].length === 0) {
        warnings.push(message);
      }
    });

    ["essentialTools", "optionalTools"].forEach(field => {
      if (!Array.isArray(guide[field])) {
        return;
      }

      guide[field].forEach((tool, index) => {
        if (!isRecord(tool) || !hasText(tool.name) || !hasText(tool.reason)) {
          warnings.push(`${field} item ${index + 1} should include name and reason`);
        }
      });
    });

    if (guide.supportingBundle !== undefined) {
      if (!isRecord(guide.supportingBundle)) {
        warnings.push("supportingBundle should be an object with handle and name");
      } else if (!hasText(guide.supportingBundle.handle) || !hasText(guide.supportingBundle.name)) {
        warnings.push("supportingBundle should include handle and name");
      }
    }

    if (!hasText(guide.takeaway)) {
      warnings.push("Playbook is missing a takeaway");
    }
  }

  function validateCollection(collection, validator, options = {}) {
    const errors = [];
    const warnings = [];
    const items = [];
    const invalidItems = [];
    const results = [];
    const seenIds = new Set();
    const label = options.label || "item";
    const key = options.key || "id";

    if (!Array.isArray(collection)) {
      return createResult([`${capitalize(label)} collection must be an array`], warnings, {
        items,
        invalidItems,
        results
      });
    }

    if (typeof validator !== "function") {
      return createResult(["Collection validator must be a function"], warnings, {
        items,
        invalidItems,
        results
      });
    }

    collection.forEach((item, index) => {
      const itemResult = validator(item, options.context || {});
      const itemErrors = [...itemResult.errors];
      const id = isRecord(item) ? item[key] : undefined;
      const identity = hasId(id) ? String(id) : `at index ${index}`;

      if (hasId(id)) {
        if (seenIds.has(String(id))) {
          itemErrors.push(`Duplicate ${label} ID: ${id}`);
        } else {
          seenIds.add(String(id));
        }
      }

      const entry = {
        ...itemResult,
        valid: itemErrors.length === 0,
        errors: itemErrors,
        item,
        index,
        identity
      };
      results.push(entry);

      entry.errors.forEach(message =>
        errors.push(`${capitalize(label)} ${formatIdentity(item, identity)}: ${message}`)
      );
      entry.warnings.forEach(message =>
        warnings.push(`${capitalize(label)} ${formatIdentity(item, identity)}: ${message}`)
      );

      if (entry.valid) {
        items.push(item);
      } else {
        invalidItems.push(item);
      }
    });

    return createResult(errors, warnings, { items, invalidItems, results });
  }

  function validateBundleCollection(collection, productIds) {
    const collectionResult = validateCollection(collection, validateBundle, {
      label: "bundle",
      context: { productIds }
    });
    const cycles = findBundleCycles(collectionResult.items);

    cycles.forEach(cycle =>
      collectionResult.errors.push(`Circular bundle reference: ${cycle.join(" -> ")}`)
    );

    if (cycles.length > 0) {
      const circularIds = new Set(cycles.flat().map(String));
      collectionResult.invalidItems.push(
        ...collectionResult.items.filter(bundle => circularIds.has(String(bundle.id)))
      );
      collectionResult.items = collectionResult.items.filter(
        bundle => !circularIds.has(String(bundle.id))
      );
      collectionResult.valid = false;
    }

    return { ...collectionResult, cycles };
  }

  function findBundleCycles(bundles) {
    const references = new Map(
      bundles.map(bundle => [
        String(bundle.id),
        Array.isArray(bundle.includedBundles)
          ? bundle.includedBundles.map(String)
          : []
      ])
    );
    const cycles = [];
    const visiting = new Set();
    const visited = new Set();

    function visit(id, path) {
      if (visiting.has(id)) {
        const start = path.indexOf(id);
        cycles.push([...path.slice(start), id]);
        return;
      }

      if (visited.has(id) || !references.has(id)) {
        return;
      }

      visiting.add(id);
      (references.get(id) || []).forEach(reference => visit(reference, [...path, id]));
      visiting.delete(id);
      visited.add(id);
    }

    references.forEach((value, id) => visit(id, []));
    return cycles;
  }

  function report(label, validation) {
    if (!validation || (!validation.errors?.length && !validation.warnings?.length)) {
      return;
    }

    const heading = `${PREFIX} ${label}`;
    validation.errors?.forEach(message => console.warn(`${heading}\n${message}`));
    validation.warnings?.forEach(message => console.warn(`${heading}\n${message}`));
  }

  function safeText(value, fallback = "") {
    return value === null || value === undefined ? fallback : String(value);
  }

  function safeNumber(value, fallback = 0) {
    return typeof value === "number" && Number.isFinite(value) ? value : fallback;
  }

  function safeArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function createSlug(value) {
    return safeText(value)
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  function isSafeImagePath(value) {
    if (!hasText(value)) {
      return false;
    }

    const path = value.trim();
    return /^(https?:\/\/|\.?\/?[a-z0-9_-])/i.test(path) &&
      !/^(javascript|vbscript):/i.test(path) &&
      !path.includes("\\");
  }

  function safeImagePath(value, fallback = "") {
    return isSafeImagePath(value) ? value.trim() : fallback;
  }

  function escapeHtml(value) {
    return safeText(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function setupImageFallback(scope) {
    if (!scope || typeof scope.querySelectorAll !== "function") {
      return;
    }

    scope.querySelectorAll("img").forEach(image => {
      const showPlaceholder = () => {
        const wrapper = image.closest(
          ".product-image-link, .product-image, .bundle-image, .bundle-detail-image, .guide-hero-image"
        );

        if (!wrapper || wrapper.classList.contains("image-placeholder")) {
          return;
        }

        wrapper.classList.add("image-placeholder");
        image.hidden = true;
        report("Images", {
          errors: [],
          warnings: [`Unable to load image: ${image.getAttribute("src") || "missing path"}`]
        });

        if (!wrapper.matches("a")) {
          wrapper.setAttribute("role", "img");
          wrapper.setAttribute(
            "aria-label",
            `${safeText(image.alt, "Product")} image placeholder`
          );
        }
      };

      image.addEventListener("error", showPlaceholder, { once: true });

      if (image.complete && image.naturalWidth === 0) {
        showPlaceholder();
      }
    });
  }

  function toIdSet(values) {
    return Array.isArray(values) ? new Set(values.map(String)) : null;
  }

  function formatIdentity(item, fallback) {
    if (isRecord(item) && hasText(item.name || item.title)) {
      return `"${item.name || item.title}"`;
    }

    return String(fallback);
  }

  function capitalize(value) {
    const text = safeText(value, "item");
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  global.MinoValidator = Object.freeze({
    GUIDE_STATUSES,
    PHILOSOPHY_VALUES,
    createSlug,
    escapeHtml,
    isSafeImagePath,
    report,
    safeArray,
    safeImagePath,
    safeNumber,
    safeText,
    setupImageFallback,
    validateBundle,
    validateBundleCollection,
    validateCollection,
    validateGuide,
    validateProduct
  });
})(window);
