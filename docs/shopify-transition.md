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
