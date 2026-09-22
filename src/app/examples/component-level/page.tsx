import { cacheLife } from "next/cache";

import { DemoLayout } from "@/components/DemoLayout";
import { RefreshButton } from "@/components/RefreshButton";
import { ResultCard } from "@/components/ResultCard";
import { simulateWork } from "@/lib/simulate";

async function CachedCard({ type }: Readonly<{ type: string }>) {
  "use cache";
  cacheLife("minutes");

  const data = await simulateWork(`component-level:${type}`);
  return <ResultCard result={data} note={`Cache entry keyed by type="${type}".`} />;
}

export default async function ComponentLevelPage() {
  return (
    <DemoLayout
      title="Component-level `use cache`"
      summary={
        <p>
          A component can cache its own rendered output. The cache key is
          derived from its serializable props, so each distinct{" "}
          <code>type</code> below gets its own independent entry — notice the
          two timestamps differ from each other, but each stays stable across
          reloads.
        </p>
      }
      code={`async function CachedCard({ type }: { type: string }) {
  'use cache'
  cacheLife('minutes')

  const data = await fetchDataFor(type)
  return <Card data={data} />
}`}
    >
      <div className="result-grid">
        <CachedCard type="haircut" />
        <CachedCard type="massage" />
      </div>
      <RefreshButton />
    </DemoLayout>
  );
}
