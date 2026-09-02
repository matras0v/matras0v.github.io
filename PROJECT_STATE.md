# MATRAS0V portfolio — project state

**Live:** https://matras0v.github.io/ · repo `matras0v/matras0v.github.io` (branch `main`)
**Local:** `/Users/vadimivancenko/Desktop/сайты/portfolio` · preview via `.claude/launch.json` (`portfolio`, port 4327)

## Shape
Single hub page (`index.html`, one file, inline `<style>` + inline `<script>`) plus
one self-contained site per work under `work/`. The repo root also holds ~21
outreach demo folders that must never be overwritten.

Sections, in order: hero → Selects (3 projects) → Contact sheet (6 concepts) →
How it works → You own it → About → final CTA → footer.

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
