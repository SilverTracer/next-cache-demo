"use cache";

import { cacheLife } from "next/cache";

import { DemoLayout } from "@/components/DemoLayout";
import { RefreshButton } from "@/components/RefreshButton";
import { ResultCard } from "@/components/ResultCard";
import { simulateWork } from "@/lib/simulate";

export default async function FileLevelPage() {
  cacheLife("minutes");
  const data = await simulateWork("file-level-page");

  return (
    <DemoLayout
      title="File-level `use cache`"
      summary={
        <p>
          Placing <code>&quot;use cache&quot;</code> at the very top of a file —
          before any imports — caches every exported function in that module,
          instead of repeating the directive on each one. Every export in a
          directive-covered file must be <code>async</code>, including this
          page&apos;s default export.
        </p>
      }
      code={`'use cache'

export default async function Page() {
  cacheLife('minutes')
  const data = await getData()
  return <div>{data}</div>
}`}
    >
      <ResultCard result={data} />
      <RefreshButton />
    </DemoLayout>
  );
}
