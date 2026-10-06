# `use cache: private` — Usage Scenarios and Caching Behavior

Use `use cache: private` for request-dependent work that needs to read
cookies, headers, or other supported runtime inputs inside the cached scope,
when its result should not persist in a shared server cache across requests.
It combines request-level deduplication with freshness information for
client-router reuse of rendered output. It is not a persistent per-user
server cache and does not guarantee that every navigation avoids the server.

**For server-side data reuse between routes, prefer regular `use cache`.**
Move session and cookie access up into the request-handling caller, verify
the session, and pass the relevant user/tenant values into a shared cached
function. Both routes can reuse that function's result for the same arguments;
`use cache: private` does not provide that cross-request server reuse.

This guide explains when that tradeoff is useful and how it behaves in
different page and navigation configurations. Its concrete observations
come from Next.js 16.3.5 with Cache Components enabled; route-level prefetch
options described here are version-specific.

## Key takeaways

- **Prefetch changes client reuse, not server semantics.** Completed runtime
  prefetch can make private rendered output available in the browser for its
  eligible stale window.
- **Mixed private and uncached work can leave a page segment incomplete.**
  Private output can appear immediately, then change when the dynamic response
  completes. Separate Suspense boundaries do not guarantee preservation of
  the older private output.
- **Prefetch does not eliminate server work.** It performs work before
  navigation. Unresolved dynamic content can require a new page-segment render
  that executes private functions again, while shared layouts and regular
  server-cached data may still be reused.
- **Data operations are not navigation requests.** Ten private calls and one
  uncached call do not necessarily mean eleven HTTP requests. One navigation
  request can execute those operations; matching private calls can deduplicate.
- **Deduplication is request-scoped, not route-scoped.** Matching calls to the
  same private function with identical arguments reuse a result within one
  server request. A later request starts a new private scope.
- **Private caching does not share persistent server results between routes.**
  For cross-request data reuse, read and verify the session outside regular
  `use cache`, then pass user and tenant inputs into a shared cached function.
  Authorize each request.
- **Back/Forward differs from route-link navigation.** History can restore
  retained output without a server request, even when an ordinary link would
  fetch fresh output.

These are observations from this Next.js 16.3.5 configuration, not a guarantee
that any uncached operation forces every part of every route to render again.

## When to use it

Good candidates include personalized recommendations, session-aware
dashboard summaries, and cookie-dependent preferences that several Server
Components need during the same request. The directive is especially useful
when runtime access is already encapsulated in a function and moving it
outside into explicit arguments would be impractical.

Choose a stale window according to how much outdated output the user can
tolerate, not just how expensive the query is. Recommendations can often
tolerate some staleness; payment status, current permissions, and critical
inventory decisions usually need a fresh authoritative check.

| Requirement                                                                                           | Prefer                                                                                |
| ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Runtime APIs must be read inside the function; no cross-request server storage                        | `use cache: private`                                                                  |
| Data should be reused across routes and server requests, including correctly keyed user-specific data | Regular `use cache`, with verified session inputs resolved outside the cached scope   |
| Only deduplicate repeated work during a Server Component request                                      | Consider React `cache`; client-router freshness is a separate concern                 |
| Always execute a data-source operation when its component renders on the server                       | A plain runtime function without a caching or memoization wrapper                     |
| Preserve personalized UI while moving between sibling pages                                           | A shared layout, while accounting for its preservation and invalidation behavior      |
| Share client-fetched data independently across routes                                                 | An explicit client data cache; private caching is not a browser function-result store |

Do not add the directive merely because a function calls `cookies()`.
First decide whether you need deduplication, server persistence, browser
reuse, or fresh data. Those are different requirements with different
mechanisms.

## Design recommendations

- Keep the private function focused on one request-dependent data operation.
  Matching calls can deduplicate; different functions or arguments should
  represent genuinely different results.
- Set `cacheLife` explicitly so reviewers can understand the intended client
  freshness without relying on an implicit profile. The example uses 60
  seconds for demonstration; that is not a recommendation for every app.
- Prefer regular `use cache` for cross-route data reuse. Personalized data
  can also use it when verified user/tenant inputs are explicit cache keys.
  Keep cookie and session reads outside that cached scope; use a private
  scope when persistent server storage is not appropriate.
- Use Suspense around request-dependent UI for streaming and loading states,
  but do not treat Suspense as an independent cache or freshness boundary.
- Keep prefetched reads free of mutations and other side effects. Prefetch
  can run before a click, and the user may never visit that route.
- Authenticate and authorize on the server whenever protected work executes.
  Neither a private cache nor a cached user ID is an authorization check.
- Return only data safe to expose to the browser. "Private" does not mean
  encrypted browser memory; never include session tokens or other secrets
  in output sent to the client.
- Refresh or invalidate after mutations when old personalized output is no
  longer acceptable. A stale window is a freshness policy, not a security
  boundary or a promise that the visible UI is continuously up to date.

## How private caching works

The important distinction is between **reusing a function result during a
server request** and **reusing rendered route output in the browser**.
`use cache: private` participates in both, but it does not create a
persistent personalized server cache.

This playground uses Next.js 16.3.5 with Cache Components enabled. The
observations below apply to its current configuration, without a custom
dynamic-page stale-time setting.

### Three different kinds of reuse

| Mechanism            | What is reused                                    | Scope                                                                                          |
| -------------------- | ------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Regular `use cache`  | Cached function result or component output        | Server cache, reusable across requests subject to lifetime and invalidation                    |
| `use cache: private` | Matching private function calls                   | Deduplicated within a production server request; not persisted across production requests      |
| Client router cache  | Previously obtained React Server Component output | Browser memory, subject to navigation mode, prefetch completeness, freshness, and invalidation |

The example's public layout demonstrates the first mechanism. Its data has
a one-hour server revalidation interval, independent of the session cookie.
The private panels demonstrate the second and third mechanisms.

`cookies()` is allowed inside a private cached scope because its result
does not enter a server cache shared across production requests. A regular
`use cache` scope cannot read cookies directly; request-derived values must
be resolved outside that scope and passed as serializable arguments.

### Initial load and request-level deduplication

A direct browser load of a route must obtain its cookie-dependent output
from the server. Enabling prefetch on links does not eliminate that initial
render. Prefetch prepares a destination for a later client navigation.

Within one render, two identical calls to `getSharedPrivateData()` return
the same ID. This is request-level deduplication: the simulated data source
executes once for that matching private call. `getRoutePrivateData(routeId)`
is a different function with a route-specific argument and produces a
separate result.

The shared private function is used on multiple routes, but its name does
not imply cross-route storage. If A and B require separate server requests,
both requests execute that function independently, even with identical
cookies. "Shared" here means shared implementation, not a persistent
private server entry.

The practical benefit here is avoiding duplicate work in a render, not
avoiding all future work for that visitor. A full reload or a new request
can execute the same private function again with the same cookie value.

The plain `getUncachedData()` has neither a cache directive nor a
deduplication wrapper. Its two calls generate different IDs during the
same render. This is a simulated data-source call, not a native `fetch`:
do not generalize this result to APIs with their own request memoization.

### Complete private output with prefetch

In this version, the example's prefetched routes combine two controls:

```tsx
// Destination page: allow runtime/session-aware partial prefetching
export const prefetch = "partial";

// Source navigation: request full prefetching of the destination
<Link href="/examples/private-navigation/b" prefetch={true}>
  Route B
</Link>;
```

Inside the private functions, `cacheLife({ stale: 60 })` contributes
freshness information for reusable client output. It does not store a
private function result on the server for 60 seconds. Other applicable
cache lifetimes can limit client reuse as well.

If a page's request-dependent output can be completed through runtime
prefetching, the browser can reuse that completed output during its eligible
stale window. The A/B example demonstrates A -> B -> A reusing A's private
IDs within that window, without a navigation-time server request. B retains
its own output; it does not consume A's private entry.

This is not "no server work": prefetch itself performs server work. It
moves that work before the click and makes the resulting output available
for reuse. Clicking before prefetch finishes can still require a request.

### Private output without prefetch

In this playground's G/H scenario, both link and route prefetch are disabled,
and the pages contain private and uncached work. With no complete reusable
client output available, navigating via route links requests fresh dynamic
output. Private functions deduplicate within that new request, but do not
retrieve private server results from the previous request.

For the installed Next.js 16.3.5, reuse of previously visited dynamic page
output during ordinary navigation has a separate lifetime: it falls back to
`experimental.staleTimes.dynamic`, whose default is `0`. A page-level
`unstable_dynamicStaleTime` export can also affect that path. This project
sets neither. `cacheLife({ stale: 60 })` contributes private-cache freshness
metadata, but is not automatically used as that dynamic-page lifetime.
The private function's configured stale value is still 60; it has not been
rewritten to zero.

This is a version- and configuration-specific explanation, not a rule that
Cache Components cannot reuse anything without prefetch. Shared layouts can
remain mounted, Back/Forward can restore output, and previously cached
complete output can still be available. Disabling prefetch does not itself
clear the client cache. G/H also contain uncached reads, so their behavior
alone does not isolate what a private-only page would do without prefetch.

The general guarantee is narrower: every new production server request has
its own private deduplication scope; no private result persists on the server
across requests. Whether navigation needs that request depends on the
client's available output and navigation policy, not just the function's
directive. See the [private-cache reference](https://nextjs.org/docs/app/api-reference/directives/use-cache-private)
and [dynamic-page stale-time reference](https://nextjs.org/docs/app/api-reference/config/next-config-js/staleTimes).

### Why mixed pages can show old data, then new data

A page can combine private and uncached panels. Its runtime-prefetched output
can contain useful private content while still leaving uncached content
unresolved. Navigation can therefore display the older private IDs
immediately, then request the remaining dynamic page output.

That server request can execute the private functions again too. When the
completed page response replaces the partial output, the private IDs change
along with the newly displayed uncached results. This does not demonstrate
that the private stale time expired: it demonstrates completion of an
incomplete page segment.

Sibling Suspense boundaries let the panels stream independently, but they
do not create independent router cache entries for each function or panel.
Splitting the components improves partial rendering; it does not guarantee
that private output will survive a subsequent page response unchanged.

### Uncached output with prefetch

Enabling prefetch does not give plain functions a cache
directive or a 60-second private lifetime. Whenever navigation requires a
dynamic response, both plain calls execute again. Any browser reuse of a
whole rendered segment must be distinguished from function-level caching.

### History navigation, refresh, and invalidation

Back/Forward can restore a previously rendered page from browser memory
without making a request. In this version, history restoration bypasses
the dynamic stale-time check. A page can therefore display old output
through history navigation even when an ordinary link would request a new
render. Do not use Back/Forward as a freshness test.

`router.refresh()` requests a new Server Component payload. Private
operations can execute again, while regular server-cached data can remain
unchanged because refresh does not itself expire that server cache. A full
reload recreates the client router state and obtains request-dependent output
again.

Cookie updates through Server Actions refresh relevant personalized output
and invalidate applicable client state. Changes made outside that flow,
such as in another tab, are not a universal guarantee of immediate refresh
in the current tab. Design logout, account switching, and permission changes
with explicit invalidation and authoritative server checks.

### Lifetime is not a refresh timer

`cacheLife({ stale: 60 })` contributes to how long eligible output can be
reused in the client; it does not create a 60-second private server entry.
`revalidate` and `expire` do not turn private functions into a persistent
server cache or provide cross-request stale-while-revalidate storage.

Expiry does not periodically refresh the screen. It affects whether cached
output is reusable when later work occurs. Prefetch completeness, shorter
applicable lifetimes, eviction, and explicit invalidation can all influence
whether navigation needs a request. Browser reloads discard in-memory
router reuse; the directive does not provide durable browser storage.

### Sharing data between routes

**Regular `use cache` is the way to share cached server data across routes.**
The cached function's identity and serializable arguments determine its
entry, not which route calls it. Two routes that call the same function with
the same relevant inputs can reuse the same result while that entry remains
valid in their caching environment. A different user or tenant must resolve
to a different key.

Calling the same private function from two routes does not establish a
cross-request personalized server cache. Reusing a shared layout can preserve
its UI across navigation, but that is layout preservation, not a data store
other page functions can query.

Lift the runtime boundary up: read cookies and verify the session in the
caller, then pass plain values down into the cached data function. The
following schematic pattern uses application-provided verification,
authorization, and database helpers:

```tsx
import { cacheLife, cacheTag } from "next/cache";
import { cookies } from "next/headers";

async function getCachedUserSummary(userId: string, tenantId: string) {
  "use cache";
  cacheLife("minutes");
  cacheTag(`user-summary:${tenantId}:${userId}`);

  return loadSummary({ userId, tenantId });
}

async function getSummaryForCurrentRequest() {
  const token = (await cookies()).get("session")?.value;
  const session = await requireVerifiedSession(token);
  await authorizeSummaryRead(session);

  return getCachedUserSummary(session.userId, session.tenantId);
}
```

Routes A and B can both call `getSummaryForCurrentRequest()`. Each request
still reads and validates its own session, but the expensive `loadSummary`
operation can be avoided on a cache hit for the same user and tenant. The
cached scope never calls `cookies()` or sees the raw session token.

Include every input that affects the result, such as locale, filters, or
permission-dependent output, in the key or the invalidation strategy.
Do not trust a raw cookie value as a user identity, omit tenant boundaries,
or put authorization only inside the cached function: a cache hit can skip
that function body. Define invalidation after mutations and permission
changes, and remember that lifetime, eviction, and deployment/cache-handler
configuration still determine whether an entry is available.

This intentionally stores user-keyed results in a server cache and is a
different privacy and persistence tradeoff from private caching. It shares
cached data-source results, not the session itself or a literal HTTP request.

## Scenario summary

| Scenario                        | What the results demonstrate                                                                                                                                      |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A/B: private only, prefetch on  | Complete prefetched output can be reused within the stale window without a request at navigation time.                                                            |
| C/D: uncached only, prefetch on | Plain calls remain independent; prefetch is not a substitute for a cache directive. Check whether the segment is complete and whether navigation makes a request. |
| E/F: mixed, prefetch on         | Private output can appear from the client first, then be replaced when a fresh dynamic page response completes.                                                   |
| G/H: mixed, prefetch off        | Route-link navigation gets fresh server output. Private duplicates match within that request; uncached duplicates do not.                                         |
| Browser Back/Forward            | Retained page output can be restored without a request. History restoration bypasses the dynamic stale-time check and is not proof of 60-second freshness.        |
| Refresh current route           | Requests new server output. Private reads execute again; the public layout data can still come from its server cache.                                             |
| Full reload                     | Recreates the browser router state and obtains fresh request-dependent output.                                                                                    |
| Cookie mutation                 | The Server Action updates the session and invalidates relevant client state; personalized output is rendered for the new cookie value.                            |

## Explore the example

From the repository root, stop any production server before rebuilding,
then run:

```bash
pnpm build
pnpm start
```

Open `/examples/private-navigation/a`. Measure caching in production mode;
development mode has additional private-cache behavior and is useful for
diagnostics, not production timing conclusions.

### Route matrix

| Pair | Link prefetch | Route prefetch   | Content            |
| ---- | ------------- | ---------------- | ------------------ |
| A/B  | `true`        | `partial`        | Private only       |
| C/D  | `true`        | `partial`        | Uncached only      |
| E/F  | `true`        | `partial`        | Private + uncached |
| G/H  | `false`       | `force-disabled` | Private + uncached |

All routes share regular cached public layout data. Private-containing
pages call one common private function twice and one route-specific private
function once. Uncached-containing pages call a plain cookie-aware function
twice. Mixed pages use sibling Suspense boundaries. The example does not
change the global dynamic-page stale-time policy.

Each real data-source execution generates an ID and timestamp and writes
`[private-navigation]` to the server log. An unchanged ID alone cannot
distinguish prefetch reuse, history restoration, layout preservation, or a
server cache hit; correlate it with requests and server logs.

### Useful checks

Use a fresh isolated browser session per pair. Cookies are shared with the
original private-cache demo within the same browser session.

| Check                               | Record                                                                                |
| ----------------------------------- | ------------------------------------------------------------------------------------- |
| Direct initial load                 | All IDs, matching private duplicates, distinct uncached duplicates, server executions |
| First navigation to sibling         | Prefetch requests versus click-triggered requests, route-specific labels              |
| Return within 60 seconds            | Immediate and fully settled IDs, not just the first displayed values                  |
| Return after more than 60 seconds   | New requests and IDs; account for automatic re-prefetching                            |
| Browser Back/Forward                | History restoration independently from route-link navigation                          |
| Refresh, full reload, cookie change | Private recomputation and session changes versus public layout-cache reuse            |

Filter Network by `_rsc` and inspect `next-router-prefetch` to distinguish
prefetch from navigation requests. Server Actions use POST. Wait for the
destination's prefetch to finish before testing reuse. The grouped menu can
prefetch other enabled pairs, so filter by the tested route's URL too.

Compare only visible route regions: Next.js may retain inactive pages in
the DOM. Record immediate and settled output, especially on mixed pages.

### Evidence limits

The manual checks report the scenarios behaving as described. Reuse within
60 seconds was observed; exact expiry at 60 seconds remains unverified, and
automatic re-prefetching can complicate measurement. These observations are
not universal guarantees for every Next.js version or route configuration.

Earlier automated production checks also reported a public-layout hydration
mismatch (React error 418), which did not reproduce in development checks.
No application fix was independently established. That diagnostic history
is separate from the cache semantics described here.
