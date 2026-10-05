import type { ReactNode } from "react";

import { DemoLayout } from "@/components/DemoLayout";
import { ResultCard } from "@/components/ResultCard";

import { SessionButtons } from "../private-cache/SessionButtons";
import { NavigationControls } from "./NavigationControls";
import { getLayoutData } from "./data";

export default async function PrivateNavigationLayout({
  children,
}: {
  children: ReactNode;
}) {
  const layoutData = await getLayoutData();

  return (
    <DemoLayout
      title="use cache: private — Usage Scenarios and Caching Behavior"
      summary={
        <p>
          Public layout: 1-hour server revalidation. Private page reads:
          60-second client stale time, no server persistence across requests.
          A/B: private only. C/D: uncached only. E/F: mixed with prefetch. G/H:
          mixed without prefetch.
        </p>
      }
      code={`// Shared layout
async function getLayoutData() {
  'use cache'
  cacheLife({ stale: 300, revalidate: 3600, expire: 86400 })
}

// Private scenarios call this twice with identical arguments
async function getSharedPrivateData() {
  'use cache: private'
  cacheLife({ stale: 60 })
  const session = (await cookies()).get('demo-session')?.value ?? 'guest'
  return simulateWork(session)
}

// Private scenarios also call getRoutePrivateData(routeId).
// Uncached scenarios call getUncachedData() twice without a directive.
// Mixed scenarios render them in sibling Suspense boundaries.
// Prefetched routes: export const prefetch = 'partial'
// Non-prefetched routes: export const prefetch = 'force-disabled'`}
    >
      <h2 className="demo-subheading">Public data in the shared layout</h2>
      <ResultCard result={layoutData} />
      <SessionButtons />
      <NavigationControls />
      {children}
      <section
        className="demo-summary"
        aria-labelledby="private-cache-takeaways"
      >
        <h2 id="private-cache-takeaways" className="demo-subheading">
          Key takeaways
        </h2>
        <ul style={{ paddingInlineStart: "1.25rem" }}>
          <li>
            <strong>
              Prefetch changes client reuse, not server semantics.
            </strong>{" "}
            Completed runtime prefetch can make private rendered output
            available in the browser for its eligible stale window.
          </li>
          <li>
            <strong>
              Mixed private and uncached work can leave a page segment
              incomplete.
            </strong>{" "}
            Private output can appear immediately, then change when the dynamic
            response completes. Separate Suspense boundaries do not guarantee
            that the older private output survives.
          </li>
          <li>
            <strong>Prefetch does not eliminate server work.</strong> It
            performs work before navigation. Unresolved dynamic content can
            require a new page-segment render that executes private functions
            again, while shared layouts and regular server-cached data may still
            be reused.
          </li>
          <li>
            <strong>Data operations are not navigation requests.</strong> Ten
            private calls and one uncached call do not necessarily mean eleven
            HTTP requests. One navigation request can execute those operations;
            matching private calls can deduplicate.
          </li>
          <li>
            <strong>Deduplication is request-scoped, not route-scoped.</strong>{" "}
            Matching calls to the same private function with identical arguments
            reuse a result within one server request. A later request starts a
            new private scope.
          </li>
          <li>
            <strong>
              Private caching does not share persistent server results between
              routes.
            </strong>{" "}
            For cross-request data reuse, read and verify the session outside
            regular <code>use cache</code>, then pass user and tenant inputs
            into a shared cached function. Authorize each request.
          </li>
          <li>
            <strong>Back/Forward differs from route-link navigation.</strong>{" "}
            History can restore retained output without a server request, even
            when an ordinary link would fetch fresh output.
          </li>
        </ul>
        <p className="demo-note">
          These are observations from this Next.js 16.3.5 configuration, not a
          guarantee that any uncached operation forces every part of every route
          to render again.
        </p>
      </section>
    </DemoLayout>
  );
}
