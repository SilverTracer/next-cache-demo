import Link from "next/link";
import { cacheLife } from "next/cache";
import { Suspense } from "react";

import { DemoLayout } from "@/components/DemoLayout";
import { RefreshButton } from "@/components/RefreshButton";
import { ResultCard } from "@/components/ResultCard";
import { simulateWork } from "@/lib/simulate";

async function getPost(published: boolean) {
  "use cache";

  if (!published) {
    // Not live yet - cache briefly so we recheck often.
    cacheLife("minutes");
    return simulateWork("conditional:draft");
  }

  // Published content changes rarely - cache much longer.
  cacheLife("days");
  return simulateWork("conditional:published");
}

type ConditionalLifetimePageProps = Readonly<{
  searchParams: Promise<{ published?: string }>;
}>;

// Reads searchParams (a request-time API) and passes only a plain boolean
// into the cached function. Isolated in its own component + <Suspense>
// boundary, since Cache Components requires dynamic reads to be streamed.
async function Content({ searchParams }: ConditionalLifetimePageProps) {
  const params = await searchParams;
  const published = params.published !== "false";
  const data = await getPost(published);

  return (
    <>
      <ResultCard
        result={data}
        note={
          published
            ? "Branch: published → cacheLife('days')"
            : "Branch: draft → cacheLife('minutes')"
        }
      />
      <div style={{ display: "flex", gap: "0.75rem" }}>
        <Link
          href="/examples/conditional-lifetime?published=true"
          className="button"
        >
          View as published
        </Link>
        <Link
          href="/examples/conditional-lifetime?published=false"
          className="button"
        >
          View as draft
        </Link>
        <RefreshButton />
      </div>
    </>
  );
}

export default function ConditionalLifetimePage({
  searchParams,
}: ConditionalLifetimePageProps) {
  return (
    <DemoLayout
      title="Conditional cache lifetime"
      summary={
        <>
          <p>
            <code>cacheLife</code> can be called conditionally — different
            branches can pick different profiles, as long as exactly one branch
            runs per invocation. Here, unpublished content is cached for{" "}
            <code>minutes</code>, published content for <code>days</code>.
          </p>
          <p className="demo-note">
            Note the pattern: <code>searchParams</code> is a request-time API,
            so it&apos;s read in the page (outside <code>use cache</code>) and
            the resulting boolean is passed as a plain argument into{" "}
            <code>getPost</code>.
          </p>
        </>
      }
      code={`async function getPost(published: boolean) {
  'use cache'
  if (!published) {
    cacheLife('minutes')
    return fetchDraft()
  }
  cacheLife('days')
  return fetchPublished()
}`}
    >
      <Suspense fallback={<p>Loading…</p>}>
        <Content searchParams={searchParams} />
      </Suspense>
    </DemoLayout>
  );
}
