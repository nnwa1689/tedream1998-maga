# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — Vite dev server with HMR (includes vite-plugin-vue-devtools)
- `npm run build` — runs `vue-tsc --build` type-check and `vite build` in parallel; output to `dist/`
- `npm run type-check` — type-check only
- `npm run preview` — serve the production build

There is no test runner or linter configured. Node `^20.19.0 || >=22.12.0`.

Note: `vue` and all `@vue/*` packages are pinned to the `beta` dist-tag via `package.json` `overrides` (Vue 3.6 / Vapor era). Keep the overrides list in sync if adding Vue-related packages.

## Architecture

A Vue 3 + TypeScript SPA that presents photo "magazine" volumes and a development-works list. All content comes at runtime from a Directus CMS at `https://teddream.tw/cms` (`/items/<Collection>` for data, `/assets/<uuid>` for images). There is no local content; the `src/data/*` files are mostly empty initial shapes that get filled by API responses.

### Routes (`src/router/index.ts`)

- `/` → `SelectIndex.vue` — list of volumes from `VolCover` (sorted `-vol_id`); clicking pushes `/vol/:vol_id`
- `/vol/:id` → `Magazine.vue` — the paged magazine reader for one volume
- `/development` → `WorksIndex.vue` — works list from `Developments` via `fetchWorksList()` in `src/data/worksData.ts`

`App.vue` wraps `RouterView` in a `<transition>` whose name comes from `route.meta.transition` (default `fade`).

### Logic lives in composables (`src/hooks/`)

Components are mostly template + styles; behavior is in composables:

- `useSelectIndex.ts` — volume fetch, navigation, and a custom rAF-based smooth wheel scroll (`setupSmoothScroll`) that is also reused by `WorksIndex.vue`.
- `useMagazine.ts` — the core of the reader:
  - `fetchMagazineData()` fires 4 parallel requests (`VolCover/:id`, `TocData/:id`, `StoryItem?filter[vol_id]`, `BackCover/:id`) and mutates the reactive objects in place (`Object.assign`, `stories.length = 0; stories.push(...)`) so existing computeds stay live. On any failure it `router.replace('/')`. Loading is held for an extra 2s.
  - `pageSequence` (computed) builds the virtual page list: `cover → toc → [talks-menu → article stories] → portfolio-menu → gallery stories → back-cover`. Talks section only exists if any story has `type === 'article'`; stories with `gallery`, `gallery-left`, or no type are portfolio. `totalPages`, chapter labels (`currentChapterName`), and category menus are all derived from this sequence — chapter numbering shifts depending on whether talks exist.
  - TOC links from the CMS may use the literal string `totalPages` for `targetPage`/`pageNumber`; these are turned into live getters via `Object.defineProperty` bound to `totalPages`.
  - Page navigation (wheel / touch swipe / arrow keys) goes through `triggerPageChange` with an 800ms cooldown; all handlers bail out if a PhotoSwipe lightbox (`.pswp--open`) is open.
  - Cover text color adapts via `checkCoverBrightness()` (canvas luminance sampling → `isCoverLight` → `isLightBg`).
  - Exposes a `vSmoothScroll` directive (smooth-scrollbar) for scrollable blocks inside a page, which stops wheel propagation until the block hits its scroll edge.

### Types and styles

- Shared CMS shapes are in `src/interfaces/magazine.ts` (`StoryItem.width/height` are used as PhotoSwipe dimensions).
- Styling is plain CSS in `src/styles/` (`magazine.css` for the reader, `SelectIndex.css` shared by both index pages), imported directly by the components. Fonts are bundled in `src/assets/fonts/`.
- `@` aliases `./src`.

`src/components/Gallery.vue` and `src/stores/counter.ts` (Pinia scaffold) are currently unused.

Code comments and UI copy are in Traditional Chinese.
