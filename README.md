# `use cache` directive demo

A small Next.js 16 app for walking through the `"use cache"` directive,
`cacheLife`, and `cacheTag` — built for a lecture / live demo.

## Running it

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — the home page links to
every example.

For the most realistic caching behavior (persistent in-memory cache across
requests), run a production build instead of dev mode:

```bash
npm run build
npm start
```

## What's enabled

`cacheComponents: true` is set in [next.config.ts](./next.config.ts), which
turns on `"use cache"`, `cacheLife`, and `cacheTag`. A custom `demoQuick`
cache profile (10s revalidate) is also defined there for the "custom
profile" example, so it visibly updates during a live demo instead of
requiring you to wait minutes/hours.

## Examples (`src/app/examples/*`)

1. **function-level** — caching a plain `async` function's return value.
2. **component-level** — caching a component's rendered output, keyed by props.
3. **file-level** — putting the directive at the top of a file to cover every export.
4. **cache-life-presets** — comparing the built-in `seconds`/`minutes`/`hours`/`days`/`weeks`/`max` profiles side by side.
5. **custom-profile** — defining a reusable profile in `next.config.ts`.
6. **inline-profile** — a one-off `cacheLife({ stale, revalidate, expire })` object.
7. **cache-tag** — tagging a cache entry and purging it on demand from a Server Action (`updateTag`).
8. **nested-caching** — how an explicit outer `cacheLife` overrides an inner one.
9. **conditional-lifetime** — picking a different `cacheLife` profile per branch, and the pattern for passing request-time values (like `searchParams`) into a cached function.

Each page shows the relevant code snippet next to a live result with a
generated timestamp/id, so reloading makes it obvious whether the value came
from cache (unchanged) or was recomputed (changed).

## Learn more

- [`use cache` directive](https://nextjs.org/docs/app/api-reference/directives/use-cache)
- [`cacheLife`](https://nextjs.org/docs/app/api-reference/functions/cacheLife)
- [`cacheTag`](https://nextjs.org/docs/app/api-reference/functions/cacheTag)
- [`cacheComponents`](https://nextjs.org/docs/app/api-reference/config/next-config-js/cacheComponents)
