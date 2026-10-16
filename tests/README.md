# Portfolio browser checks

Serve the existing static repository: `python3 -m http.server 4327 --bind 127.0.0.1`.
With Playwright available to Node, run:

```sh
node tests/portfolio-responsive.cjs
node tests/portfolio-interactions.cjs
```

No build step or application dependencies were added. Use an installed Playwright runtime (`NODE_PATH` if needed). Optional environment variables: `BASE_URL` (defaults to http://127.0.0.1:4327), `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`, and `OUTPUT_DIR` (defaults to the system temp directory / matrasov-qa).

Responsive checks cover the homepage and three client cases in EN/RU at 375, 390, 430, 768, 1024, 1280, 1366, 1440 and 1600, plus all five concepts, H&M and GrimeVPN cases and owned demos at 390/1440. They collect document overflow, visible label clipping, response codes, broken image sources and page errors, and capture rendered states.

Interaction checks assert URL/storage/default locale priority, case locale round trips, logo/All work destinations, exact external hosts, keyboard controls, same-origin preview locale, owned bot dialogue, touch gesture direction, real seven-second autoplay, hover pause and the manual reading hold. The timing checks take about 25 seconds. Numeric and scripted results are supplemented by visual inspection of captures; they do not establish physical iPhone/Safari compatibility.
