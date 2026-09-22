import { cacheLife } from "next/cache";

import { DemoLayout } from "@/components/DemoLayout";
import { RefreshButton } from "@/components/RefreshButton";
import { ResultCard } from "@/components/ResultCard";
import { simulateWork } from "@/lib/simulate";

import { Widget } from "./Widget";

async function Dashboard() {
  "use cache";
  cacheLife("hours");

  const data = await simulateWork("nested:dashboard");
  return (
    <>
      <ResultCard
        result={data}
        note="Outer scope: explicit cacheLife('hours')."
      />
      <Widget />
    </>
  );
}

export default async function NestedCachingPage() {
  return (
    <DemoLayout
      title="Nested `use cache` scopes"
      summary={
        <>
          <p>
            <code>Dashboard</code> (outer, <code>hours</code>) renders{" "}
            <code>Widget</code> (inner, <code>minutes</code>). Because the outer
            scope sets an <strong>explicit</strong> <code>cacheLife</code>, it
            always wins — the dashboard&apos;s timestamp is refreshed on its own{" "}
            <code>hours</code> schedule, regardless of the widget having a
            shorter lifetime.
          </p>
          <p className="demo-note">
            If the outer scope omitted <code>cacheLife</code> entirely, it would
            fall back to the <code>default</code> profile, and a{" "}
            <em>shorter</em> inner lifetime could pull the outer one down with
            it. Always set an explicit <code>cacheLife</code> on outer scopes to
            keep behavior predictable.
          </p>
        </>
      }
      code={`async function Widget() {
  'use cache'
  cacheLife('minutes') // inner
  return <Card data={await getWidgetData()} />
}

async function Dashboard() {
  'use cache'
  cacheLife('hours') // outer wins, explicit
  return (
    <>
      <Card data={await getDashboardData()} />
      <Widget />
    </>
  )
}`}
    >
      <div className="result-grid">
        <Dashboard />
      </div>
      <RefreshButton />
    </DemoLayout>
  );
}
