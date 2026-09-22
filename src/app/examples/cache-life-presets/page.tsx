import { cacheLife } from "next/cache";
import { Suspense } from "react";

import { DemoLayout } from "@/components/DemoLayout";
import { RefreshButton } from "@/components/RefreshButton";
import { ResultCard } from "@/components/ResultCard";
import { simulateWork } from "@/lib/simulate";

const NOTES = {
  seconds: "stale 30s / revalidate 1s / expire 1min",
  minutes: "stale 5min / revalidate 1min / expire 1hr",
  hours: "stale 5min / revalidate 1hr / expire 1day",
  days: "stale 5min / revalidate 1day / expire 1week",
  weeks: "stale 5min / revalidate 1week / expire 30days",
  max: "stale 5min / revalidate 30days / expire 1year",
} as const;

// cacheLife's type only accepts a literal profile name per call, so each
// preset gets its own tiny cached function instead of one parameterized helper.
async function getSeconds() {
  "use cache";
  cacheLife("seconds");
  return simulateWork("seconds");
}
async function getMinutes() {
  "use cache";
  cacheLife("minutes");
  return simulateWork("minutes");
}
async function getHours() {
  "use cache";
  cacheLife("hours");
  return simulateWork("hours");
}
async function getDays() {
  "use cache";
  cacheLife("days");
  return simulateWork("days");
}
async function getWeeks() {
  "use cache";
  cacheLife("weeks");
  return simulateWork("weeks");
}
async function getMax() {
  "use cache";
  cacheLife("max");
  return simulateWork("max");
}

// `seconds` has a 1-minute expire, under the 5-minute prerender threshold,
// so it's a "dynamic hole" and needs its own Suspense boundary. The other
// presets are long-lived enough to be part of the static shell.
async function SecondsCard() {
  const result = await getSeconds();
  return <ResultCard result={result} note={NOTES.seconds} />;
}

async function LongLivedPresets() {
  const results = await Promise.all([getMinutes(), getHours(), getDays(), getWeeks(), getMax()]);
  return (
    <>
      {results.map((result) => (
        <ResultCard
          key={result.label}
          result={result}
          note={NOTES[result.label as keyof typeof NOTES]}
        />
      ))}
    </>
  );
}

export default function CacheLifePresetsPage() {
  return (
    <DemoLayout
      title="`cacheLife` built-in presets"
      summary={
        <p>
          Next.js ships preset profiles that trade off how long the client
          reuses data, how often the server regenerates it in the background,
          and when it fully expires. Reload repeatedly — <code>seconds</code>{" "}
          changes almost every time, the others stay put much longer.
        </p>
      }
      code={`import { cacheLife } from 'next/cache'

async function getData() {
  'use cache'
  cacheLife('hours') // seconds | minutes | hours | days | weeks | max
  return fetchData()
}`}
    >
      <div className="result-grid">
        <Suspense fallback={<div className="result-card">Loading…</div>}>
          <SecondsCard />
        </Suspense>
        <LongLivedPresets />
      </div>
      <RefreshButton />
    </DemoLayout>
  );
}
