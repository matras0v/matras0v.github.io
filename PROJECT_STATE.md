# MATRAS0V portfolio — project state

**Live:** https://matras0v.github.io/ · repo `matras0v/matras0v.github.io` (branch `main`)
**Local:** `/Users/vadimivancenko/Desktop/сайты/portfolio` · preview via `.claude/launch.json` (`portfolio`, port 4327)

## Shape
Single hub page (`index.html`, one file, inline `<style>` + inline `<script>`) plus
one self-contained site per work under `work/`. The repo root also holds ~21
outreach demo folders that must never be overwritten.

Sections, in order: hero → Selects (3 projects) → Contact sheet (6 concepts) →
How it works → You own it → About → final CTA → footer.

## The field (WebGL background)
`#fx` is a fixed full-viewport canvas at `z-index:-1` running one fragment
shader: four-octave fbm height with a double domain warp, a real surface
normal, and two pools of light — a warm key and a cool fill carrying the
current project's colour (`uAccent`). `uHero` fades it from full strength in
the hero to a fifth below; `uEnd` raises it past hero strength in the closing
scene, where the pointer also carries its own bloom. Lights are positioned in
screen space, not the aspect-corrected surface space, so portrait phones keep
their atmosphere. Render scale 0.33 desktop / 0.26 mobile (30fps cap on
coarse pointers); the loop stops on `document.hidden`, draws one still frame
under reduced motion, and falls back to `.no-fx` CSS gradients if the context
will not start. Sections that need the field to show through must use a
translucent background — `.contact` and `footer` do.

## Spatial objects and per-project signatures
Four spatial objects for the whole page — a ribbon in the hero, a glass pane in
the contact sheet, an arc in About, a sheet under the closing scene. Each lives
in an `.obj-wrap` (`position:absolute; inset:0; z-index:-1; overflow:hidden`)
inside a `position:relative` section; the wrapper's own overflow is what
guarantees an object can never widen the document. `.contact > *` must keep its
`:not(.obj-wrap)` exclusion or the object jumps in front of the text.

Each project has one signature interaction, all of it on overlays *inside*
`.window` — never on the iframe:
- **s-01 Snowzan** — the tilt handler adds `scale(1.035)` for this frame only.
- **s-02 H&M** — `.polish`, a swirled veil whose radial mask opens to `--pr:210px`
  on hover (`@property --pr`, initial 1px: a zero radius is under-defined and
  Safari renders it fully transparent). Drops to `opacity:.18` on coarse pointers.
- **s-03 GrimeVPN** — `.scan`, a line grid plus one travelling band, animation
  paused unless `.s-03.active`.
The two off-centre screens carry a resting `rotateY(±2.4deg)` that relaxes to
±0.5deg on hover.

## The case studies
The three case pages (`work/snowzan/`, `work/hm-polishing/`, `work/grimevpn-case/`)
share `assets/case.css` + `assets/case.js` — deliberately, because they have to
read as one system with the hub. This is the **only** shared CSS in the repo: the
concept sites under `work/*/` stay self-contained so they look like different
studios made them.

Per-case identity is four tokens set on `html[data-case="snowzan|hm|grime"]`
(`--lit`, `--lit-a/b/c`) and nothing else: Snowzan cool violet, H&M polished
bronze, GrimeVPN colder indigo. The room itself is `.atmos` — three fixed radial
lights on a 64s drift, plus the hub's grain and vignette. No canvas: the hub
earns a shader because the work hangs on it, a case study only needs the page to
stop being flat black behind the words.

`.eframe` is the case-page twin of the hub's `.frame`: one lit dot in the
project's colour, a quiet uppercase plate, and a standing arrow when the frame is
a door. Both were rebuilt away from the three-grey-dots browser mockup.

**H&M demo framing.** The case page measures `#buff` inside the concept site
(same origin) and crops the mount to it, then re-applies one diagonal
destination-out stroke on the site's own canvas for the first three seconds —
the panel is a near-opaque dark layer by design and reads as an empty rectangle
without it. `fit()` resizing the iframe makes the concept site repaint its swirl,
which is why the stroke is re-applied on an interval rather than once.

## Load-bearing details — do not change casually
- **Live previews.** `.frame[data-live]` → `.window{aspect-ratio:16/9 ≥760px, 5/4 below}`
  → `iframe{width:var(--srcw); height:2600px}`. `srcWidth()` = 430 below 760px viewport,
  else 1400. The iframe element is a fixed 2600px box, so anything the embedded site
  renders below 2600px is simply not painted.
- **Visible band** = `1400 × (H/W of the window's aspect-ratio)` → 787.5px at 16/9.
  A pan is only safe while `data-start + data-scroll + band ≤ 2600`.
- Several embedded sites (Snowzan, Lustre) have viewport-height heroes, so inside a
  2600px iframe their first screen is 2600px tall. Raising the iframe height stretches
  those heroes and pushes their real content permanently out of reach — do not.
- **Desktop hover-pan** and **mobile auto-pan** (`ENTRY .25`, `DWELL 150ms`,
  `EXIT_DEBOUNCE 300ms`, `panIO`) are frozen by the client's instruction. Verify any
  diff with `git diff | grep -c 'EXIT_DEBOUNCE\|panIO\|touchPan'` → must be 0.
- **Selected Work** runs on a 12-column stage inside the content measure
  (`@media (min-width:1000px)`), tracks are exact twelfths of
  `min(100% - 2*--pad, --content)`. Below 1000px `.sel-head{display:contents}` lets the
  spec list be ordered after the preview so the title-to-preview gap stays ~16px.
- The tilt/depth on `.frame` writes only to `.window`'s transform. The iframe's
  transform belongs to the live-preview and pan systems; never write to it.
- `.step::before` and every other ambient glow must use a vertical-only inset
  (`inset:-6% 0`). Any horizontal bleed has nothing clipping it and pushes
  `scrollWidth` past the viewport — this has now caused the same bug twice.
- Grid quirk that has bitten twice: a grid item with any `auto` margin loses stretch,
  so `max-width` alone gives it no size — set an explicit `width`.

## Known, accepted
- The Snowzan hero fills its whole 2600px iframe, so Select 01's 2100px hover pan
  travels inside that one screen. Left as-is; fixing it means touching pan data.
- H&M Car Polishing is a concept awaiting the client's own photography — deliberately
  not filled with stock. All four invented brands are labelled "Concept" on the page.

## Verification before every push
Zero horizontal overflow at 1600 / 1440 / 1366 / 1280 / 1024 / 768 / 430 / 375;
zero console errors; all `work/*` URLs return 200; hover-pan smoke test via a
dispatched `PointerEvent`; `prefers-reduced-motion` respected.

Note: in the Claude browser pane `document.visibilityState` is `hidden`, which
suspends rAF, transitions and IntersectionObserver — so reveal animations and the
lazy iframe loader never run there. Work around it by removing the `js` class and
setting the iframe transforms by hand before screenshotting.

## EN/RU bilingual system (added 2026-09-19)
Every page — hub, all 3 case studies, all 5 concepts — is now bilingual.
`assets/i18n.js` is the shared engine: English is the DOM's own native content
(captured once via `WeakMap` the first time an element is touched), Russian is a
per-page `window.I18N_<PAGE>_RU` object handed to `MLang.init(dict)`. State lives
in `localStorage['matrasov_lang']`; a fresh visitor always sees English — only an
explicit `.lang-btn` click ever sets `'ru'`. `MLang.set(lang)`/`MLang.onChange(fn)`
exist for pages needing more; see below.
- `data-i18n="key"` swaps `innerHTML`; always on the innermost text-only leaf,
  never on an element (or ancestor) any JS attaches a listener to or selects by
  id/class. `data-i18n-attr="attr:key;attr2:key2"` does the same for attributes.
- **Lucienne is JS-rendered, not static** — its lookbook, shop grid, product
  sheet and cart are all built from a `P`/`LOOKS` data object via `innerHTML`
  strings, so `data-i18n` can't reach them (it only swaps text already in the
  DOM). Fixed by giving `MLang` an `onChange(fn)` hook (additive, safe for every
  other page): Lucienne's own script re-runs its render functions on language
  switch, reading each field through a small `t(obj, field)` helper that checks
  `obj.ru[field]` first. Any future JS-rendered concept should use the same
  `ru:{...}` sibling-object + `t()` + `MLang.onChange()` pattern rather than
  inventing a new one.
- **Concept pages own their own `.lang-switch` CSS** (self-contained, no shared
  file) — same visual spec everywhere (quiet "EN / RU", active = brighter +
  underline) but re-skinned to each site's own tokens, matching the "different
  studio" design principle above.
- **RU text overflows mobile navs the English original didn't** — found and
  fixed on Aurelis and Lustre specifically: a flex item's default
  `min-width:auto` refuses to shrink below its own content, and Russian labels
  (Концепт, Корзина, etc.) are often longer than the English ones. If a future
  translation causes horizontal overflow, check for exactly this before adding
  ad-hoc breakpoints — `min-width:0` on the flex item, or shrinking the specific
  nav element that grew, not shrinking everything.

## Mobile preview-crop fix (2026-09-19)
Client-reported bug: on mobile the live-preview cards (hub `.window`, case-page
`.live-window`) showed almost nothing recognizable — just a slice of a hero
photo. Two causes, both fixed:
1. **`.window`/`.live-window` mobile `aspect-ratio` was inverted** — `5/4`
   (landscape) instead of `4/5` (portrait, as the adjacent code comment already
   said). Fixed across `index.html` and all 3 case pages; desktop's
   `@media(min-width:760px)` override was untouched.
2. **Snowzan's real site has a 100vh hero** — inside the fixed-height preview
   iframe (2600px on the hub, 2400px on the case page's before/after thumbnail,
   3400px on its "Running, right here" live embed) that hero alone fills nearly
   the whole render, so a `data-start` of 0 showed only photo, no headline/CTA.
   Fixed with per-frame `data-start-mobile` (existing mechanism, already used by
   Lustre) plus a new `data-scroll-mobile` (mirrors `data-start-mobile`) so the
   mobile auto-pan doesn't try to travel past the 2600px cutoff into blank
   iframe once the resting position already shows everything worth showing.
   Also fixed a real bug on Snowzan's case page: the mobile
   `.eframe-win{overflow:visible}` override meant for the before/after
   comparison mount was unintentionally also matching `.live-window` (shared
   class) — scoped it to `.eframe-win:not(.live-window)`.
Snowzan's "one-man" framing was also outdated (client formed Snowzan LLC) —
copy on the hub card, the case page hero/meta, and both RU translations now say
"growing mobile detailing brand" instead.
