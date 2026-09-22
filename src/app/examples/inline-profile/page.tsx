import { cacheLife } from "next/cache";
import { Suspense } from "react";

import { DemoLayout } from "@/components/DemoLayout";
import { RefreshButton } from "@/components/RefreshButton";
import { ResultCard } from "@/components/ResultCard";
import { simulateWork } from "@/lib/simulate";

async function getData() {
  "use cache";
  cacheLife({
    stale: 5,
    revalidate: 10,
    expire: 30,
  });

  return simulateWork("inline-profile");
}

// 30s expire is under the 5-minute prerender threshold, so this is a
// "dynamic hole" and must be isolated in Suspense.
async function Result() {
  const data = await getData();
  return <ResultCard result={data} />;
}

export default function InlineProfilePage() {
  return (
    <DemoLayout
      title="Inline `cacheLife` profile"
      summary={
        <p>
          For a one-off cache lifetime that doesn&apos;t need to be reused
          elsewhere, pass an object literal straight to <code>cacheLife</code>{" "}
          instead of defining a named profile in{" "}
          <code>next.config.ts</code>. Any property you omit falls back to
          the <code>default</code> profile&apos;s value.
        </p>
      }
      code={`async function getData() {
  'use cache'
  cacheLife({
    stale: 5,       // seconds, client reuse window
    revalidate: 10,  // seconds, background refresh
    expire: 30,      // seconds, hard expiry
  })
  return fetchData()
}`}
    >
      <Suspense fallback={<p>Loading…</p>}>
        <Result />
      </Suspense>
      <RefreshButton />
    </DemoLayout>
  );
}
