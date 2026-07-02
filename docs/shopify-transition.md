# Shopify Transition Map

The storefront is organized around stable browser-facing APIs so Shopify can
replace infrastructure without forcing a page rewrite.

| Current storefront | Shopify theme equivalent | Swap point |
| --- | --- | --- |
| `js/data/products.json` | Products, collections, and metafields | `StoreData` |
| `data/bundles.json` | Curated collections or bundle products | `BundleData` |
| `js/data/bundle-access.js` | Bundle collection or Storefront API query | Keep `getBundles()` and `getBundleByHandle()` signatures |
| `js/data/data-access.js` | Liquid objects or Storefront API queries | Keep `getProducts()`, `getProductByHandle()`, and `getCollections()` signatures |
| `product.html?handle=...` | `/products/{{ product.handle }}` | `ProductUI.getProductUrl()` |
| Collection filter handles | `/collections/{{ collection.handle }}` | Catalog controller and `StoreData.getCollections()` |
| `js/core/cart.js` | Shopify Ajax Cart API | Keep the public `Cart` methods and replace storage internals |
| `site-header` / `site-footer` | Header and footer sections | Move component markup into Liquid section files |
| `ProductUI` | Product-card snippet and product section | Preserve product/collection handle fields and schema markup |
| `BundleUI` | Bundle-card snippet and guided shopping section | Preserve bundle handles and included product references |
| `data/guides.json` | Shopify blog articles or pages | `GuideData` |
| `js/data/guide-access.js` | Blog or Storefront API query | Keep `getGuides()` and `getGuideByHandle()` signatures |
| `GuidanceUI` | Approval badge and product-metafield snippets | Preserve philosophy values and selection fields |

Product records already expose `handle`, `collection`, and `seo` fields. These
map naturally to Shopify product handles, collection objects, and SEO fields;
additional product attributes can be migrated into metafields.

Bundle records separate solution copy, included product IDs, optional product
handles, and FAQs from their renderer. Product philosophy values and the
`problemSolved`, `whyChosen`, `spaceSaving`, `easyToClean`, and `bestFor`
fields can move directly into Shopify metafields without changing page UI.

## Commerce identity contract

Catalog `id` values are internal content references only. They must never be
sent to Shopify's cart endpoint. Shopify cart requests use a product variant ID;
cart changes should use the returned line item key whenever possible.

During migration, add Shopify identifiers without replacing the stable Mino
handle or internal ID:

```json
{
  "id": 1,
  "handle": "digital-air-fryer",
  "shopify": {
    "productId": "gid://shopify/Product/...",
    "variantId": "..."
  }
}
```

Do not invent these values before products exist in Shopify. The readiness
check reports missing variant IDs as migration items, not catalog errors.

## Metafield map

Use a `mino` namespace and preserve these data-driven fields:

| Current field | Shopify destination |
| --- | --- |
| `problemSolved` | `mino.problem_solved` (multi-line text) |
| `whyChosen` | `mino.why_chosen` (multi-line text) |
| `bestFor` | `mino.best_for` (multi-line text) |
| `spaceSaving` | `mino.space_saving` (multi-line text) |
| `easyToClean` | `mino.easy_to_clean` (multi-line text) |
| `philosophy` | `mino.philosophy` (list of single-line text) |
| `philosophyExplanation` | `mino.philosophy_explanation` (multi-line text) |
| `minoReview.score` | `mino.score` (integer) |
| `minoReview.approved` | `mino.approved` (boolean) |
| `minoReview.positives` | `mino.positives` (list of single-line text) |
| `minoReview.complaints` | `mino.complaints` (list of single-line text) |
| `minoReview.rationale` | `mino.rationale` (multi-line text) |

Bundles should become Shopify bundle products or curated metaobjects that
reference product variants. Keep the existing bundle handle as the stable
migration key. Do not duplicate bundle membership onto products unless a
Shopify theme query requires a derived lookup.

## Activation sequence

1. Create products, variants, SKUs, inventory rules, weights, and shipping data
   in Shopify.
2. Import Mino content and define the metafields above.
3. Create bundle products or metaobjects and verify component inventory behavior.
4. Replace `StoreData` and `BundleData` internals with Liquid or Storefront API data.
5. Replace local cart storage with locale-aware Ajax Cart requests using variant IDs.
6. Use Shopify's `canonical_url`, money filters, product availability, policy
   objects, and checkout rather than duplicating those systems in JavaScript.
7. Run `node scripts/shopify-readiness.js`, theme checks, keyboard testing, and
   a real test order before opening the store.

## Launch-owned settings

The following belong in Shopify admin and intentionally remain outside this
prototype: payments, taxes, markets/currency, shipping profiles, inventory,
customer notifications, domain/DNS, analytics consent, and the refund,
privacy, terms, shipping, and contact policies. Confirm every one before
removing the storefront password.
