# MATRAS0V portfolio — current handoff

Live target: https://matras0v.github.io · repository matras0v/matras0v.github.io · main.
Local: /Users/vadimivancenko/Desktop/сайты/portfolio (chat cwd is a different folder).

## 2026-10-17 implementation
- Existing single-file hub and shared case/i18n architecture retained. Current source was clean at start, HEAD 8a30f0a.
- Added one three-project featured stage, canonical assets/projects.js registry, own CSS/JS. Snowzan default, 7s desktop rotation only while visible; hover/focus/interaction/hidden/reduced-motion pause; manual controls and mobile swipe, no mobile autoplay. Static responsive artboards avoid simultaneous live iframes.
- Added work/pravilnye-tekhnologii case and EN/RU authored preview, using public project-owned product and four-brand images copied read-only from local PT source. Actual exact IDN production domain opened read-only and verified. No production client site/storefront changed, including existing root pravilnye-tehnologii folder.
- Selected clients ordered Snowzan, ShineMate, PT; H&M and owned GrimeVPN separated as Additional work; concept frames 01–05. Existing Snowzan preview composition retained.
- Shared MLang extended with URL > storage > EN priority, internal-link locale propagation, same-origin iframe locale bridge, popstate support. Cases preserve current route when switching. ShineMate existing preview localized, headline middle line muted gray, badge wraps. Concepts get a small persistent portfolio escape outside embeds.
- WhatsApp remains +79184134820; Telegram/Instagram @matras0v; email mskvvmskvv@gmail.com.
- Preview assets generated: EN/RU × desktop/mobile for all three clients. Primary editorial cards reuse these artboards; no duplicate client iframes run on the homepage. The old clipped reveal observer deadlock was fixed at its source.
- Local validation: 108 responsive/locale states, 36 JavaScript syntax checks and 16 interaction checks passed. Six additional focus/visibility/mobile/lazy-media/capture groups passed; 183 static internal asset/route references valid. Evidence captured and visually inspected. See QA_REPORT.md. Reusable tests in tests/.
- GitHub authentication confirmed outside sandbox. Pages uses main branch root (legacy build). Next: commit/push and verify deployed EN/RU, third case and mobile controls. Browser MCP lacks Chrome; installed Playwright Chromium works via bundled package and explicit executable.

## Existing preview constraints retained
- Hub .frame[data-live], data-vh and project-specific --win-m compose local websites. Snowzan 900/760 + 1/1.18 mobile is the approved reference. Do not change its image crop.
- Existing desktop/mobile pan subsystem untouched. Concepts remain independent; assets/case.css and case.js are shared only for cases.
- Existing root outreach/demo folders and pravilnye-tehnologii storefront are unrelated and must not be edited.
- Screenshots of original Snowzan retain authentic English and are labeled original English website; authored ShineMate/PT artboards follow portfolio locale.
