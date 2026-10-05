import { cookies } from "next/headers";
import { Suspense } from "react";

import { DemoLayout } from "@/components/DemoLayout";
import { RefreshButton } from "@/components/RefreshButton";
import { ResultCard } from "@/components/ResultCard";

import { SessionButtons } from "./SessionButtons";
import { DEMO_COOKIE, getPersonalGreeting, getSharedGreeting } from "./data";

const PERMISSIONS = [
  { api: "cookies()", regular: "No - pass as argument", private: "Yes" },
  { api: "headers()", regular: "No - pass as argument", private: "Yes" },
  { api: "searchParams", regular: "No - pass as argument", private: "Yes" },
  { api: "connection()", regular: "No", private: "No" },
] as const;

// Reads cookies() *outside* the cached scope - this is the pattern regular
// `use cache` requires. Dynamic read, so it needs its own Suspense boundary.
async function SharedPanel() {
  const session = (await cookies()).get(DEMO_COOKIE)?.value ?? "guest";
  const data = await getSharedGreeting(session);

  return (
    <ResultCard
      result={data}
      note={`Shared, server-side cache entry for session="${session}". Stays frozen across reloads for the 'minutes' lifetime - any OTHER visitor whose session also resolves to "${session}" would be served this exact same result.`}
    />
  );
}

// Calls the same private-cache function twice to show request-level dedup:
// both results match *within* one request, but change on every new request.
async function PrivatePanel() {
  const [first, second] = await Promise.all([getPersonalGreeting(), getPersonalGreeting()]);

  return (
    <div className="result-grid">
      <ResultCard result={first} note="Call #1 - reads cookies() directly inside the cached scope." />
      <ResultCard
        result={second}
        note={
          second.id === first.id
            ? "Call #2 - identical id: deduped within this one request."
            : "Call #2 - different id (unexpected)."
        }
      />
    </div>
  );
}

export default function PrivateCachePage() {
  return (
    <DemoLayout
      title="`use cache: private` vs regular `use cache`"
      summary={
        <>
          <p>
            Regular <code>use cache</code> cannot read <code>cookies()</code>,{" "}
            <code>headers()</code>, or <code>searchParams</code> - those
            values must be read outside the cached function and passed in as
            plain arguments. <code>&quot;use cache: private&quot;</code>{" "}
            lifts that restriction: it can call those request APIs{" "}
            <em>directly</em>, at the cost of never being written to a cache
            shared across requests or users.
          </p>
          <p className="demo-note">
            Set the cookie below, then hit reload a few times. The{" "}
            <strong>shared</strong> panel&apos;s timestamp freezes (server
            cache hit), while the <strong>private</strong> panel&apos;s
            timestamp changes on every single reload - even though the
            cookie didn&apos;t change - because a private cache is never
            persisted across requests on the server. The two private cards
            on one reload do share an id, though: calls are still deduped
            within a single request.
          </p>
        </>
      }
      code={`// Regular \`use cache\`: must receive the session as a plain argument
async function getSharedGreeting(session: string) {
  'use cache'
  cacheLife('minutes')
  return fetchGreeting(session)
}

// \`use cache: private\`: allowed to read cookies() directly
async function getPersonalGreeting() {
  'use cache: private'
  cacheLife({ stale: 60 })
  const session = (await cookies()).get('demo-session')?.value ?? 'guest'
  return fetchGreeting(session)
}`}
    >
      <SessionButtons />

      <h3 className="demo-subheading">
        Regular <code>use cache</code> - session passed in as an argument
      </h3>
      <Suspense fallback={<div className="result-card">Loading…</div>}>
        <SharedPanel />
      </Suspense>

      <h3 className="demo-subheading">
        <code>use cache: private</code> - reads <code>cookies()</code> directly
      </h3>
      <Suspense fallback={<div className="result-card">Loading…</div>}>
        <PrivatePanel />
      </Suspense>

      <RefreshButton label="Reload (new request)" />

      <h3 className="demo-subheading">Which request APIs are allowed where?</h3>
      <table className="compare-table">
        <thead>
          <tr>
            <th>API</th>
            <th>Allowed in `use cache`</th>
            <th>Allowed in `use cache: private`</th>
          </tr>
        </thead>
        <tbody>
          {PERMISSIONS.map((row) => (
            <tr key={row.api}>
              <td>
                <code>{row.api}</code>
              </td>
              <td>{row.regular}</td>
              <td>{row.private}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="demo-note">
        <code>connection()</code> is off-limits in both, since it exposes
        connection-specific information that can never be safely cached.
        There is also a third sibling directive,{" "}
        <code>&quot;use cache: remote&quot;</code>, for data that should be
        shared across server instances via an external cache handler (for
        example Redis) - not covered here since it needs a configured
        hosting provider, but worth knowing it exists alongside these two.
      </p>
    </DemoLayout>
  );
}
