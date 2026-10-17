# MATRAS0V portfolio — current state

Live: https://matras0v.github.io · GitHub matras0v/matras0v.github.io · main · Pages builds main /.
Actual checkout: /Users/vadimivancenko/Desktop/сайты/portfolio (chat cwd is a different folder).

## Architecture and preserved constraints
- Existing static hub index.html, shared case.css/case.js and assets/i18n.js. No build dependencies.
- assets/projects.js is the three-project registry. Featured image artboards use assets/previews/{id}-{en|ru}-{desktop|mobile}.webp. Desktop 1400×820; portrait 430×740. Source previews live under each work/{route}/preview/.
- Snowzan default; 7s desktop autoplay while visible, pause on hover/focus/hidden/reduced motion; 16s manual hold, keyboard/swipe; no mobile autoplay. No simultaneous feature iframes.
- MLang: query language > stored > EN; case route preserved, internal links retain language, same-origin iframe locale bridge. Original Snowzan screenshots retain authentic English and are labeled.
- Snowzan preview crop, ShineMate case/preview, concepts, existing pan system and root demo/storefront folders must remain untouched by PT work.
- Genuine contacts: WhatsApp +79184134820; Telegram/Instagram @matras0v; email mskvvmskvv@gmail.com.
- External PT production and its separate local source are read-only: https://правильные-технологии.рф (IDNA xn----7sbgfibseaydudober7b6czgta.xn--p1ai). Local source /Users/vadimivancenko/Desktop/правильные-технологии(сайт).

## Completed foundation
- 8a893f7 implementation + 5c9e6b9 verification: three real projects, EN/RU, navigation, concepts/contacts. Prior 108-state responsive matrix and 16 interaction groups passed; live verified.
- f0c8228: PT photographic case pass, pushed. V2 steering arrived immediately afterward and superseded its case-only scope.

## 2026-10-17 PT V2
- Authorized scope: PT third feature preview and PT case only; preserve carousel structure and all Snowzan/ShineMate designs and assets.
- PT preview now has an oversized authentic Koch workbench photo, identity/catalog CTA and real EX620/F6.01/HC4000 product cards. Dedicated mobile composition; four optimized local WebP artboards. Registry explicitly labels curated presentation and Russian live store.
- Case order: compact intro → signature photographic triptych → equipment/compound/pad depth → real photographic brands → catalog/category links with integrated portrait screen → genuine contact finish. Removed standalone sparse mobile and repeated process section.
- Authentic local source assets include Koch workbench/workshop campaign, ShineMate equipment/tool wall/in-use polisher, Space Quazar portrait, COLOURLOCK leather care, product packshots and compound application. No invented products/prices/reviews/metrics; translated compositions disclosed. Actual catalog/category/brand routes verified against source.
- Final local QA: 18 case states (EN/RU × 375/390/430/768/1024/1280/1366/1440/1600), 16 homepage PT states, actual desktop/mobile section renders inspected in both languages, no overflow/clipped checked text/broken images/JS or HTTP errors. Corrected F6.01 scale after visual review.
- Existing 16-group interaction regression passed, including all three case returns/locales, carousel keyboard/swipe/autoplay/pause/manual hold, exact external links, concept escape and ShineMate iframe localization. Snowzan/ShineMate/shared carousel files have no diff.
- Reusable scoped test: tests/pt-case.cjs; browser runtime variables match existing tests. Evidence: Codex visualizations/2026/10/16/01a146c0-5005-7791-b902-19148acd20ca/pt-v2.
- V2 implementation 041664686790e95ce74a4e0a484b31ccbd34da67 committed/pushed. Pages built successfully at 2026-10-17 07:58:41 UTC (10:58 MSK). Fresh live Chromium QA passed 18 case + 16 homepage states, locale/return navigation and genuine CTA targets, zero JS/HTTP/asset errors. Live desktop/mobile renders inspected. SHA-256 verified all 14 changed implementation assets against the committed local files. Evidence: sibling pt-v2-live directory. V2 work complete.
- Browser testing uses installed Playwright Chromium (bundled runtime, explicit Chromium executable); native Safari/physical devices are unverified.


## 2026-10-17 ShineMate case visual upgrade
- New user scope supersedes the PT-only restriction for this task: ShineMate CASE only. PT V2 approved and frozen; Snowzan, homepage/carousel, original ShineMate preview source/artboards, shared assets and all external production sources remain unchanged.
- Replaced the text-heavy introduction, brief and five-decision rows with compact ShineMate identity/scope → immediate existing bright storefront → substantial EX620 working photograph with rotary/cordless/battery/pad range → photographed machine/plate/pad/compound selection sequence → localized real EB251-5 product-page adaptation and integrated mobile view → existing contact/project navigation.
- Official shinemate-russia.ru homepage, catalog and EB251-5 detail inspected read-only in Chromium. Actual product/category URLs, 18 V platform, 5-inch M14 plate, included handle/key and battery/charger exclusions confirmed. Compatibility sequence mirrors the actual homepage's EP820/M14/Black Diamond T40/V40 chain; no invented prices/specifications/reviews/metrics.
- Assets copied read-only from authorized Desktop/ShineMate/shinemate-russia-frontend-2026-10-13-eb251-5.zip. Authentic EX620 in-use photo and EP820/EB251-5/18 V battery/Black Diamond pads/M14 plates/V40 packshots. Case-local presentation/ source generates four 1280×880 / 430×860 EN/RU WebP product screens, labeled as portfolio adaptations; original live site remains Russian.
- Mobile opening orders the equipment photograph first via a case-only style added to the same-origin local preview iframe; original preview file and homepage images are unchanged. Both languages fit the 740px frame. Shared MLang and preview resizing retained.
- Local checks: 16 case states (EN/RU × 375/390/430/768/1024/1280/1440/1600), four product-artboard fit states, locale/return/logo navigation, correct external targets and exact contact href preservation. No overflow, clipped checked text, broken images, JS/HTTP errors. Desktop/mobile/tablet section renders inspected; fixed product/logo scale and tablet cropping/readability based on screenshots. Existing 16-group portfolio interaction regression passed.
- Reusable test: tests/shinemate-case.cjs. Evidence: Codex visualizations/2026/10/16/01a146c0-5005-7791-b902-19148acd20ca/shinemate-case. Native Safari and physical devices not tested.
- Final scoped verification passed after tablet crop correction; all 16 case states and four product-artboard states remain clean. Next: commit/push, verify Pages build, live renders/navigation and asset hashes.
