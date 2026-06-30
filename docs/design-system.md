# Mino Kitchens Design System

This document is the styling source of truth for Mino Kitchens. Reusable visual values live in `css/variables.css`; components and pages should consume those custom properties instead of introducing new literals.

## Stylesheet order

Every page loads the layers in this order:

1. `variables.css` — design tokens
2. `base.css` — reset, type defaults, links, media, and focus behavior
3. `layout.css` — containers, sections, and reusable grids
4. `styles.css` — page and feature-specific layout retained by the current site
5. `components.css` — buttons, cards, headers, labels, and form controls
6. `utilities.css` — the intentionally small utility layer
7. `responsive.css` — shared narrow-screen and reduced-motion behavior

New reusable rules belong in the appropriate shared layer. Add a page-specific rule to `styles.css` only when it cannot reasonably be expressed with an existing component or layout class.

## Color palette

| Token | Role | Value |
| --- | --- | --- |
| `--color-background` | Main page and card background | `#ffffff` |
| `--color-surface` | Warm alternate surface | `#f5f2eb` |
| `--color-primary` | Charcoal actions and strong text | `#222222` |
| `--color-secondary` | Mino sage | `#8faf9b` |
| `--color-accent` | Mino terracotta | `#c97b63` |
| `--color-text` | Default text | `#222222` |
| `--color-text-muted` | Supporting text | `#626763` |
| `--color-border` | Standard dividers and outlines | `#e4e1da` |

Soft, focus, state, and contrast colors are also defined in `variables.css`. Use semantic state tokens rather than copying their underlying values.

## Typography

Headings use `--font-heading` (Poppins). Body copy, controls, and buttons use `--font-body` (Inter with system fallbacks).

| Token | Intended use |
| --- | --- |
| `--font-size-hero` | Homepage hero heading |
| `--font-size-page-title` | Page and article titles |
| `--font-size-section-title` | Section headings |
| `--font-size-xl` | Small display headings |
| `--font-size-card-title` | Product, bundle, journey, guide, and principle titles |
| `--font-size-lg` / `--font-size-lead` | Introductory and emphasized copy |
| `--font-size-md` | Body copy and form fields |
| `--font-size-sm` / `--font-size-caption` | Supporting labels and captions |
| `--font-size-button` | All button variants |
| `--font-size-xs` | Compact metadata |

Do not add an arbitrary `font-size` to a component. Choose the closest semantic role, or add a documented role token when the system truly needs one.

## Spacing

The scale follows a four/eight-pixel rhythm:

| Token | Value |
| --- | --- |
| `--space-3xs` | 4px |
| `--space-2xs` | 8px |
| `--space-xs` | 12px |
| `--space-sm` | 16px |
| `--space-md` | 24px |
| `--space-lg` | 32px |
| `--space-xl` | 40px |
| `--space-2xl` | 48px |
| `--space-3xl` | 64px |
| `--space-4xl` | 80px |
| `--space-5xl` | 96px |
| `--space-section` | 112px |
| `--space-page-end` | 128px |

Use `--space-section` for desktop section rhythm and the smaller responsive value supplied by `responsive.css` on narrow screens. Card interiors normally use `--space-lg`, reducing to `--space-md` on mobile.

## Buttons

The base class is `.button`. Only three variants are supported:

- `.button.button--primary` — filled charcoal action
- `.button.button--secondary` — outlined secondary action
- `.button.button--text` — low-emphasis inline action

Legacy classes such as `.hero-button` and `.secondary-button`, along with generated product/cart controls, inherit the same system. New markup should prefer the `.button` API. Do not create page-specific button colors, radii, type sizes, or transitions.

## Cards

Use `.card` as the generic card foundation and `.card__body` for its padded content. Existing product, bundle, journey, guide, principle, cart, benefit, and selection cards inherit the same border, `--card-radius`, `--shadow-light`, and hover transition.

Bundle cards may use a larger layout or image area, but should not redefine the shared radius, border, elevation, or motion language.

## Sections

- `.section` supplies standard vertical rhythm.
- `.section-light` uses the warm alternate surface.
- `.section-accent` uses the soft sage surface.
- `.section-title` and `.section-subtitle` provide shared heading treatment.
- `.section-header` is the centered component used by generated section headers.

Prefer these classes over page-specific section padding and background rules.

## Containers

| Class / token | Purpose |
| --- | --- |
| `.container` / `--container-width` | Standard content width, 1180px maximum |
| `.container-narrow` / `--content-width` | Reading and header width, 720px maximum |
| `.container-wide` / `--container-wide` | Wide editorial or merchandising layouts, 1280px maximum |

Supporting semantic widths (`--reading-width`, `--article-width`, `--feature-width`,
`--content-width-lg`, and `--catalog-width`) cover readable copy and established
catalog layouts. Card and control caps use `--card-width`, `--card-width-wide`,
and `--control-width`. All containers include responsive side gutters. Avoid
adding literal or repeated `max-width` declarations when one of these roles fits.

## Radius, shadow, and motion

- Cards use `--card-radius` (10px).
- Buttons and form controls use `--button-radius` (6px).
- Standard borders use `--border-width`; stronger and accent borders use the documented width tokens.
- Pills use `--radius-pill`; circular elements use `--radius-round`.
- Resting cards use `--shadow-light`; elevated hover states use `--shadow-medium`.
- Standard interactions use `--transition-normal`; very small feedback may use `--transition-fast`.
- Hover movement uses the `--motion-lift-*` scale rather than component-specific translation values.
- Reduced-motion users receive effectively immediate transitions through `responsive.css`.

## Utilities

The supported utility set is deliberately small: `.text-center`, `.text-muted`, `.mb-sm`, `.mb-md`, `.mb-lg`, `.mt-lg`, `.flex-center`, `.grid-auto`, `.hidden`, `.rounded`, and `.shadow-light`.

Utilities are for isolated composition adjustments. If the same combination appears repeatedly, promote it to a component or layout rule instead of expanding the utility layer.

## Component guidelines

1. Start with an existing container, section, button, or card primitive.
2. Use only tokens for color, type size, spacing, radius, shadow, and transition values.
3. Keep component state styles beside the component in `components.css`.
4. Keep page-specific geometry in `styles.css` and shared breakpoints in `responsive.css`.
5. Preserve visible keyboard focus, useful labels, and reduced-motion behavior.
6. When adding a token, document its role here; do not add a token merely to disguise a one-off literal.
