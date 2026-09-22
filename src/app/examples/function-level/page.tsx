import { cacheLife } from "next/cache";

import { DemoLayout } from "@/components/DemoLayout";
import { RefreshButton } from "@/components/RefreshButton";
import { ResultCard } from "@/components/ResultCard";
import { simulateWork } from "@/lib/simulate";

async function getData() {
  "use cache";
  cacheLife("minutes");

  return simulateWork("function-level");
}

export default async function FunctionLevelPage() {
  const data = await getData();

  return (
    <DemoLayout
      title="Function-level `use cache`"
      summary={
        <p>
          The directive goes at the top of an <code>async</code> function.
          Every call with the same arguments reuses the cached return value.
          Click refresh a few times — the timestamp below stays frozen until
          the <code>minutes</code> profile revalidates.
        </p>
      }
      code={`async function getData() {
  'use cache'
  cacheLife('minutes')

  const res = await fetch('https://api.example.com/data')
  return res.json()
}`}
    >
      <ResultCard result={data} note="Unchanged across reloads = served from cache." />
      <RefreshButton />
    </DemoLayout>
  );
}
