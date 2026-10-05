"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { RefreshButton } from "@/components/RefreshButton";
import { SCENARIOS } from "./scenarios";

export function NavigationControls() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <>
      <nav className="demo-result" aria-label="Private cache scenarios">
        {SCENARIOS.map((scenario) => (
          <div
            className="button-row"
            key={scenario.content + scenario.prefetch}
          >
            <span className="demo-subheading">{scenario.label}</span>
            {scenario.routes.map((destination) => {
              const current = pathname.endsWith(`/${destination}`);
              return (
                <Link
                  key={destination}
                  className="button"
                  href={`/examples/private-navigation/${destination}`}
                  prefetch={scenario.prefetch}
                  aria-current={current ? "page" : undefined}
                >
                  Route {destination.toUpperCase()}
                  {current ? " (current)" : ""}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
      <div className="button-row">
        <button
          type="button"
          className="button"
          aria-label="Browser Back"
          title="Browser Back"
          onClick={() => router.back()}
        >
          &larr;
        </button>
        <button
          type="button"
          className="button"
          aria-label="Browser Forward"
          title="Browser Forward"
          onClick={() => router.forward()}
        >
          &rarr;
        </button>
        <RefreshButton label="Refresh current route" />
        <button className="button" onClick={() => window.location.reload()}>
          Full reload
        </button>
      </div>
    </>
  );
}
