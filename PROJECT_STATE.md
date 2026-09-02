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
