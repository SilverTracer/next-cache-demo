import { Suspense } from "react";

import { DemoLayout } from "@/components/DemoLayout";
import { RefreshButton } from "@/components/RefreshButton";

import { LiveStock } from "./LiveStock";
import { ProductDetails } from "./ProductDetails";

// Prerender a few sample ids at build time; other ids still work, they're
// just rendered - and cached - on first request instead (dynamicParams).
export async function generateStaticParams() {
  return [{ id: "1" }, { id: "2" }, { id: "3" }];
}

type PageProps = Readonly<{ params: Promise<{ id: string }> }>;

async function Content({ params }: PageProps) {
  const { id } = await params;

  return (
    <div className="result-grid">
      <ProductDetails id={id} />
      <Suspense
        fallback={<div className="result-card">Loading live stock…</div>}
      >
        <LiveStock id={id} />
      </Suspense>
    </div>
  );
}

export default function DynamicSegmentPage({ params }: PageProps) {
  return (
    <DemoLayout
      title="Dynamic route segment with cached components"
      summary={
        <>
          <p>
            This is a dynamic route, <code>/examples/dynamic-segment/[id]</code>
            . Try changing the id in the URL — <code>ProductDetails</code>{" "}
            caches its output per <code>id</code> for <code>hours</code>, while{" "}
            <code>LiveStock</code> right next to it is deliberately left
            uncached, so it recomputes on every request.
          </p>
          <p className="demo-note">
            <code>generateStaticParams</code> prerenders ids <code>1</code>,{" "}
            <code>2</code>, and <code>3</code> at build time. Other ids (try{" "}
            <code>/examples/dynamic-segment/42</code>) are still supported —
            they render and cache on first request.
          </p>
        </>
      }
      code={`export async function generateStaticParams() {
  return [{ id: '1' }, { id: '2' }, { id: '3' }]
}

async function ProductDetails({ id }: { id: string }) {
  'use cache'
  cacheLife('hours')
  cacheTag(\`product-\${id}\`)
  return <Card data={await fetchProduct(id)} />
}

export default async function Page({ params }) {
  const { id } = await params
  return (
    <>
      <ProductDetails id={id} /> {/* cached */}
      <LiveStock id={id} />       {/* not cached */}
    </>
  )
}`}
    >
      <Suspense fallback={<p>Loading…</p>}>
        <Content params={params} />
      </Suspense>
      <RefreshButton />
    </DemoLayout>
  );
}
