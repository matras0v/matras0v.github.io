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
- **Live previews.** `.frame[data-live]` → `.window{aspect-ratio:16/9 ≥760px, 1/1 below}`
  → `iframe{width:var(--srcw); height:2600px}`. The iframe element is a fixed 2600px
  box, so anything the embedded site renders below 2600px is simply not painted.
- **`srcWidth(frame)` is per-frame, not global** (2026-09-20). 430 below a 760px
  viewport; above it, `clamp(900, round(window.clientWidth / 0.68), 1400)` — the
  embedded site never renders below ~two-thirds scale (at a flat 1400 a narrow
  contact-sheet cell showed it at 34%, which reads as a thumbnail, not a site) and
  never below 900, where several of the embedded sites drop into their own mobile
  layout. Changing this changes where content sits vertically inside every frame,
  so re-check `data-start` after touching it. A debounced `resize` listener refits
  every loaded frame, since the source width is now a function of layout.
- **Visible band** = `srcWidth × (H/W of the window's aspect-ratio)`.
  A pan is only safe while `data-start + data-scroll + band ≤ 2600`.
- **`data-vh` is the fix for a viewport-height hero** (2026-09-21). The iframe's
  HEIGHT decides what `100vh` is worth inside it. At 2600 a site built around a
  full-height first screen renders that screen 2600px tall, and any band cut out of
  it is one stretched slice — and the slice that scales with the box is the
  photograph, which is why Snowzan's card kept coming out as a picture of a car no
  matter how the crop was moved. `data-vh="900/760"` (desktop/phone) hands the frame
  a real viewport so the hero composes as it does in a browser. Such a frame is a
  composed still: `startOf()` returns 0 and `scrollDistOf()` returns 0, so it does
  not pan, and `.frame[data-vh] .window` is cut to `1/1.18` on phones to reach the
  bottom of the first screen's primary button. Frames currently on it: the hero
  frame, Select 01, and the Contact Sheet's LUSTRE cell.
  Every frame is on it now (2026-09-21), each with its own viewport and its own
  phone band via `--win-m`, measured against the site rather than picked:

  | frame | data-vh | --win-m | the band reaches |
  |---|---|---|---|
  | Snowzan (hero, s-01) | 900/760 | 1/1.18 | both hero buttons — THE REFERENCE, do not re-tune |
  | H&M s-02 | 900/780 | 1/1.26 | the type block; its panel is dark by design |
  | GrimeVPN s-03 | 900/780 | 1/1.6 | headline, both CTAs, chat mock, tiers row |
  | Lumen cell 1 | 900/780 | 1/1.3 | header, headline, both CTAs |
  | Aurelis cell 2 | 900/800 | 1/1.5 | headline, copy, "Choose a floor" |
  | Lucienne cell 3 | 900/820 | 1/1.55 | headline over the photograph |
  | Ember & Oak cell 4 | 900/820 | 1/1.72 | identity through the whole booking widget |
  | LUSTRE cell 5 | 900/780 | 1/1.44 | headline and the CTA row under it |

  Re-tuning one means re-measuring that site, not copying a neighbour's number.
  A band must always stay inside its own `data-vh`; the QA harness asserts this.
- **H&M's card is a veil, not a crop.** `.polish` is a swirled overlay whose mask
  opens with `--pr`. Fully shut the card was a uniform dark rectangle that said
  nothing, and a phone never got to open it, so it rests at `--pr:170px` (a pool of
  corrected paint beside unworked paint — the project's whole idea) and opens to
  430px on hover. On coarse pointers the veil sits at opacity .6, not .18.
- The Snowzan case study's `#liveSite` embed had the identical bug and the identical
  fix — `--srch` 900/760 in place of a 3400px box. Its hover pan was removed with it
  (it travelled to -2600px, which is now past the end of the iframe); the two large
  buttons under the frame were always the real way through to the site.
- Snowzan and Lustre are the two embedded sites with viewport-height heroes. Both
  are on `data-vh` now, which is the answer to that: RAISING the iframe height
  stretches such a hero further and is still wrong, LOWERING it to a real viewport
  is the fix. The rule is that the box should be a plausible browser window, not
  that it should be tall.
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

## Art-direction pass (2026-09-20, commit 0a3c645)
- **Case pages share the hub's measure.** `--wrap` 1280 → 1760 with
  `--gutter:clamp(20px,3.4vw,68px)`, so `.wrap` resolves to exactly what the hub's
  content column does. `h1` 88→112, `h2` 48→66, `.dec h3` 30→40; `.dec` gets a
  1fr/1.06fr split above 1200px so the prose column stays ~65 characters instead of
  growing to 90. `.facts` becomes a lit panel above 1000px.
- **Russian has its own headline scale** — `html[lang="ru"] h1{clamp(32px,4.9vw,78px)}`
  plus a wider `.head-grid` first column. "сфотографировать" is one unbreakable
  16-letter word; at the English display size it ran 230px past its column. Any
  future type-scale change must be re-checked in RU, not only EN.
- **`.btn svg{flex:none}`** in index.html, case.css and all five concept pages. A
  bare inline SVG in a flex button is a shrinkable flex item, and on a narrow screen
  the browser resolved the overflow by collapsing the WhatsApp mark to zero width.
  It had been invisible on mobile. Do not remove.
- Contact sheet is 7/5 · 5/7 · 12 (was 8/4 · 4/8 · 12) — four twelfths left the
  narrow cells ~480px, too small for the site inside to read as a built page.
- Lustre now has the real contact module (`#hire`, `.vh-*` classes in its own
  steel-blue language) that the other four concepts already had.
- The hub header keeps the name at every width; the short CTA label and a tighter
  language switch buy the room back below 560px.

## Curation pass (2026-09-21, commit 9f39ff9)
- Contact sheet caption scale follows frame size (wide 7-col prints larger than the
  quiet 5-col pair) and LUSTRE closes the sheet as an anchor: full measure, largest
  name, its sentence set beside the name via `grid-template-areas`, `1.8/1` window.
  That ratio is measured, not chosen — it is the band that reaches the bottom of
  LUSTRE's first screen with both CTAs still inside.
- The process rail gained stations: `.step::after` anchored to the hairline each
  step begins on (NOT an offset from the step's top — that padding is responsive and
  drifts), lit by `.passed`/`.active` which the scroll handler toggles alongside
  `--progress`. `.steps.done + .owns::before` carries a short length of rail across
  the boundary into the ownership statement once the third station is passed.

## Known, accepted
- The Snowzan hero fills its whole 2600px iframe, so Select 01's hover pan
  travels inside that one screen. Left as-is; fixing it means touching pan data.
- The local dev server serves a stale `assets/case.css` after edits. Visual checks
  of case pages must inject the file from disk (`fetch('/assets/case.css?nc='+Date.now())`)
  or they silently test the previous version. GitHub Pages is not affected.
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
