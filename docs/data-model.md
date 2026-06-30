# Mino Kitchens Data Model

This document is the content reference for products, bundles, and guides. All external data is treated as untrusted and must pass `js/data/validator.js` before it reaches a rendering function.

Validation failures are data-quality results, not application exceptions. Invalid records are omitted, valid records continue loading, and concise messages are written with the `[Mino Validator]` prefix.

## Validation result

Individual validators return:

```js
{
  valid: true,
  errors: [],
  warnings: []
}
```

`validateCollection()` additionally returns `items`, `invalidItems`, and per-record `results`. `items` is the safe collection that data adapters expose to the UI.

## Product schema

```js
{
  id: string | number,
  handle: string,
  name: string,
  price: number,
  description: string,
  image: string,
  category: string,
  collectionHandles: string[],
  philosophy: ("essential" | "multipurpose" | "spacesaving")[],
  features: string[],
  relatedProducts: string[]
}
```

Required fields:

- `id`: non-empty string or number; unique across products
- `name`: non-empty text
- `price`: finite, non-negative number
- `description`: non-empty text
- `image`: safe relative path or HTTP(S) URL
- `category`: non-empty text, normally resolved from the primary collection
- `philosophy`: array containing only supported values

Optional fields include `features`, `relatedProducts`, `philosophyExplanation`, `problemSolved`, `whyChosen`, `spaceSaving`, `easyToClean`, `bestFor`, and `seo`. Optional arrays normalize to empty arrays. Missing explanatory copy uses neutral text fallbacks and never renders `undefined` or `null`.

An invalid product is never returned by `StoreData` and therefore cannot be rendered or added to a bundle display.

## Bundle schema

```js
{
  id: string | number,
  handle: string,
  name: string,
  description: string,
  image: string,
  idealFor: string,
  includedProducts: (string | number)[],
  includedBundles: (string | number)[],
  optionalAdditions: string[],
  faqs: { question: string, answer: string }[]
}
```

Required fields:

- `id`: non-empty string or number; unique across bundles
- `name`: non-empty text
- `description`: non-empty text
- `idealFor`: non-empty text
- `includedProducts`: array of product IDs

`image` is recommended. A missing or unsafe image produces a warning and uses the shared placeholder so existing image-free bundles remain usable.

Relationship rules:

- Every `includedProducts` value should reference a valid product ID.
- Missing product references are removed from that bundle and logged; the bundle remains available.
- `optionalAdditions` contains product handles and missing handles are logged when resolved.
- Future `includedBundles` references must not form a cycle. Bundles involved in a circular relationship are omitted.
- Bundle records with structural errors are omitted; unrelated bundles continue loading.

## Guide schema

```js
{
  id: string | number,
  title: string,
  slug: string,
  summary: string,
  heroImage: string,
  status: "draft" | "published" | "archived",
  sections: { heading: string, body: string }[],
  seo: { title: string, description: string }
}
```

Required fields:

- `id`: non-empty string or number; unique across guides
- `title`: non-empty text
- `slug`: non-empty URL identifier
- `summary`: non-empty card/article summary
- `status`: one of the supported statuses

Optional fields:

- `heroImage`: missing or unsafe values warn and use a placeholder when rendered
- `sections`: missing content warns; incomplete sections are omitted
- `seo`: safe defaults are generated from the title and summary

Only `published` guides are exposed to public rendering.

### Legacy guide compatibility

The current JSON uses `handle` and `description`. The guide adapter maps these fields before validation:

- `handle` → `id` and `slug`
- `description` → `summary`
- missing `status` → `published`

This adapter boundary lets future Shopify responses map to the canonical schema without adding provider-specific assumptions to UI components.

## Collection and duplicate rules

Every top-level dataset must be an array (or, for the product catalog, an object containing a `products` array). Collection validation:

1. validates each normalized record;
2. detects duplicate IDs;
3. keeps the first valid occurrence and rejects later duplicates;
4. reports errors and warnings;
5. returns only valid items for rendering.

Examples of developer messages:

```text
[Mino Validator] Products
Duplicate product ID: air-fryer-001

[Mino Validator] Bundles
Bundle "First Apartment Kit": Missing product reference: mixing-bowl-002
```

## Image behavior

Image paths are validated for a safe relative path or HTTP(S) URL. Runtime load failures use the shared `.image-placeholder` treatment, hide the broken image element, preserve accessible labeling, and emit one concise warning.

File existence is checked by the browser when the image loads. This works for local assets today and remote Shopify CDN assets later.

## Rendering contract

Rendering code receives data only through `StoreData`, `BundleData`, or `GuideData`. UI components still use defensive helpers for text, numbers, arrays, URLs, and images so unexpected direct calls cannot output `undefined`, `null`, or `NaN`.

Do not fetch JSON directly from a UI component. Provider-specific normalization belongs in a data adapter; schema validation belongs in `validator.js`; DOM construction belongs in the UI layer.
