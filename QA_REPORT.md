# MATRAS0V portfolio validation — 17 October 2026

## Local result: PASS

- 108 rendered route / locale / viewport states: homepage and all three client cases in EN/RU at 375, 390, 430, 768, 1024, 1280, 1366, 1440 and 1600; H&M/GrimeVPN cases, five concepts and two owned demos at 390/1440. Zero horizontal document overflow, clipped checked labels, broken loaded image sources or page errors.
- 36 inline/shared JavaScript syntax checks; `git diff --check`; 183 static internal route/asset references with no missing targets. Static project: no application build step exists.
- 16 interaction groups passed: case EN→RU→EN remains on route; All work and logo preserve locale and correct destination; URL > storage > English; three keyboard-accessible tabs; exact external client domains; zero feature iframes; same-origin ShineMate preview locale; bilingual owned demos and bot conversation; swipe direction; seven-second desktop rotation, hover pause and sixteen-second manual reading hold.
- Six additional groups passed: keyboard focus pause, document-hidden event pause, mobile autoplay disabled, mobile menu keyboard escape, visible editorial/lazy preview content, PT brands/mobile captures. Page visibility was simulated through the document event; physical browser-background behavior was not independently exercised.
- Visually inspected 390/1440 EN/RU compositions, all three featured projects, PT selected card and case, four PT brand images, existing ShineMate editorial card, Snowzan reference, and Lumen with its persistent return link. Corrected a fully clipped reveal-observer deadlock and intrinsic iframe/image sizing defects discovered during these checks.
- PT's exact IDN domain was inspected read-only in a real Chromium browser, including desktop, mobile and brand section. Its project-owned assets were copied into the portfolio. The Russian production site was not changed.

## Presentation and scope

Snowzan artwork deliberately retains its original English UI and is captioned as such. ShineMate and PT use translated, locally authored EN/RU presentation artboards; their external production websites remain Russian. No new business metrics, backend/payment scope or paying-client claims were invented. H&M is a concept; GrimeVPN is an owned product.

No files under the existing root `pravilnye-tehnologii/` storefront, external client repositories, or external production servers were changed. All three external live links retain the exact requested hosts. WhatsApp remains +79184134820, Telegram/Instagram @matras0v, email mskvvmskvv@gmail.com.

## Reproduction and limits

Use `tests/README.md` and the two saved Playwright checks. Representative rendered screenshots and JSON results are saved as local chat artifacts. Browser checks use Chromium; physical iPhone, native Safari and Telegram/Instagram in-app browsers remain unverified. Contact links were inspected without sending messages.

## Release

Implementation validated locally. Commit/push and live Pages verification follow this report; deployment result is recorded in PROJECT_STATE.md.
