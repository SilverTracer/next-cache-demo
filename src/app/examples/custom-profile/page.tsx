import { cacheLife } from "next/cache";
import { Suspense } from "react";

import { DemoLayout } from "@/components/DemoLayout";
import { RefreshButton } from "@/components/RefreshButton";
import { ResultCard } from "@/components/ResultCard";
import { simulateWork } from "@/lib/simulate";

async function getData() {
  "use cache";
  cacheLife("demoQuick");

  return simulateWork("custom-profile:demoQuick");
}

// A 30s expire is under the 5-minute prerender threshold, so this becomes a
// "dynamic hole" resolved at request time - it must be isolated in Suspense.
async function Result() {
  const data = await getData();
  return (
    <ResultCard
      result={data}
      note="Reload roughly every 10 seconds to see the timestamp move."
    />
  );
}

export default function CustomProfilePage() {
  return (
    <DemoLayout
      title="Custom `cacheLife` profile"
      summary={
        <p>
          Custom profiles live in <code>next.config.ts</code> under{" "}
          <code>cacheLife</code> and are referenced by name, just like the
          built-in presets. This demo defines a fast <code>demoQuick</code>{" "}
          profile (10s revalidate) so you can watch it flip during a talk
          without waiting minutes.
        </p>
      }
      code={`// next.config.ts
const nextConfig = {
  cacheComponents: true,
  cacheLife: {
    demoQuick: { stale: 5, revalidate: 10, expire: 30 },
  },
}

// page.tsx
async function getData() {
  'use cache'
  cacheLife('demoQuick')
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

