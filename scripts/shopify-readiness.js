"use strict";

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const catalog = readJson("js/data/products.json");
const bundles = readJson("data/bundles.json");
const guides = readJson("data/guides.json");
const products = Array.isArray(catalog) ? catalog : catalog.products || [];
const collections = Array.isArray(catalog.collections) ? catalog.collections : [];
const errors = [];
const warnings = [];

function readJson(relativePath) {
  try {
    return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
  } catch (error) {
    console.error(`[Shopify Readiness] Unable to read ${relativePath}: ${error.message}`);
    process.exitCode = 1;
    return {};
  }
}

function duplicateValues(items, field) {
  const seen = new Set();
  const duplicates = new Set();
  items.forEach(item => {
    const value = String(item?.[field] ?? "").trim();
    if (!value) return;
    if (seen.has(value)) duplicates.add(value);
    seen.add(value);
  });
  return [...duplicates];
}

function exists(relativePath) {
  return Boolean(relativePath) && fs.existsSync(path.join(root, relativePath));
}

function isHandle(value) {
  return typeof value === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
}

duplicateValues(products, "id").forEach(value => errors.push(`Duplicate product ID: ${value}`));
duplicateValues(products, "handle").forEach(value => errors.push(`Duplicate product handle: ${value}`));
duplicateValues(bundles, "id").forEach(value => errors.push(`Duplicate bundle ID: ${value}`));
duplicateValues(bundles, "handle").forEach(value => errors.push(`Duplicate bundle handle: ${value}`));
duplicateValues(guides, "id").forEach(value => errors.push(`Duplicate guide ID: ${value}`));
duplicateValues(guides, "slug").forEach(value => errors.push(`Duplicate guide slug: ${value}`));

const productIds = new Set(products.map(product => String(product.id)));
const productHandles = new Set(products.map(product => product.handle));
const collectionHandles = new Set(collections.map(collection => collection.handle));

products.forEach(product => {
  const label = product.name || product.id || "Unnamed product";
  if (!isHandle(product.handle)) errors.push(`${label}: invalid or missing Shopify handle`);
  if (!exists(product.image)) warnings.push(`${label}: image is missing locally (${product.image || "no path"})`);
  if (!Array.isArray(product.collectionHandles) || product.collectionHandles.length === 0) {
    warnings.push(`${label}: no collection handle`);
  } else {
    product.collectionHandles.forEach(handle => {
      if (!collectionHandles.has(handle)) errors.push(`${label}: unknown collection ${handle}`);
    });
  }
  (product.relatedProducts || []).forEach(handle => {
    if (!productHandles.has(handle)) warnings.push(`${label}: missing related product ${handle}`);
  });
  if (!product.seo?.title || !product.seo?.description) warnings.push(`${label}: incomplete SEO fields`);
  if (!product.shopify?.variantId) {
    warnings.push(`${label}: Shopify variant ID not assigned yet (expected before theme cart activation)`);
  }
});

bundles.forEach(bundle => {
  const label = bundle.name || bundle.id || "Unnamed bundle";
  if (!isHandle(bundle.handle)) errors.push(`${label}: invalid or missing bundle handle`);
  (bundle.includedProducts || []).forEach(id => {
    if (!productIds.has(String(id))) errors.push(`${label}: missing included product ID ${id}`);
  });
  (bundle.optionalAdditions || []).forEach(handle => {
    if (!productHandles.has(handle)) warnings.push(`${label}: missing optional product ${handle}`);
  });
});

const requiredFiles = [
  "js/core/cart.js",
  "js/data/data-access.js",
  "js/data/bundle-access.js",
  "docs/shopify-transition.md"
];
requiredFiles.forEach(file => {
  if (!exists(file)) errors.push(`Missing migration seam: ${file}`);
});

console.log("Mino Kitchens — Shopify readiness\n");
console.log(`Products: ${products.length}`);
console.log(`Bundles: ${bundles.length}`);
console.log(`Collections: ${collections.length}`);
console.log(`Guides: ${guides.length}\n`);

errors.forEach(message => console.error(`ERROR: ${message}`));
warnings.forEach(message => console.warn(`READY-LATER: ${message}`));

if (errors.length > 0) {
  console.error(`\nResult: ${errors.length} blocking issue(s), ${warnings.length} migration item(s).`);
  process.exitCode = 1;
} else {
  console.log(`\nResult: no structural blockers; ${warnings.length} migration item(s) remain.`);
}
