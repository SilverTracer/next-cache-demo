import { DemoLayout } from "@/components/DemoLayout";
import { RefreshButton } from "@/components/RefreshButton";
import { ResultCard } from "@/components/ResultCard";

import { InvalidateButton } from "./InvalidateButton";
import { getTaggedData } from "./data";

export default async function CacheTagPage() {
  const data = await getTaggedData();

  return (
    <DemoLayout
      title="`cacheTag` + on-demand invalidation"
      summary={
        <p>
          Tagging a cache entry with <code>cacheTag</code> lets you purge it
          on demand — no need to wait for <code>cacheLife</code> to expire.
          This entry is cached for <code>hours</code>, but clicking the
          button below runs a Server Action that calls{" "}
          <code>updateTag(&apos;demo-tag&apos;)</code>, so the very next read
          sees fresh data immediately.
        </p>
      }
      code={`// data.ts
async function getTaggedData() {
  'use cache'
  cacheLife('hours')
  cacheTag('demo-tag')
  return fetchData()
}

// actions.ts
'use server'
export async function invalidate() {
  updateTag('demo-tag') // fresh on the very next read
  // or: revalidateTag('demo-tag', 'max') for stale-while-revalidate
}`}
    >
      <ResultCard result={data} note="Long-lived (hours) until invalidated on demand." />
      <div style={{ display: "flex", gap: "0.75rem" }}>
        <InvalidateButton />
        <RefreshButton label="Refresh only (no invalidation)" />
      </div>
    </DemoLayout>
  );
}
