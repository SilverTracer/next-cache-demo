import { Suspense } from "react";

import { PrivatePanels, UncachedPanels } from "./PrivatePanels";
import { type DemoRoute, getScenario } from "./scenarios";

export function ScenarioPage({ route }: { route: DemoRoute }) {
  const scenario = getScenario(route);

  return (
    <>
      <h2 className="demo-subheading">
        Route {route.toUpperCase()}: {scenario.label}
      </h2>
      {scenario.content !== "uncached" ? (
        <Suspense
          fallback={<div className="result-card">Loading private reads...</div>}
        >
          <PrivatePanels route={route} />
        </Suspense>
      ) : null}
      {scenario.content !== "private" ? (
        <Suspense
          fallback={
            <div className="result-card">Loading uncached reads...</div>
          }
        >
          <UncachedPanels route={route} />
        </Suspense>
      ) : null}
    </>
  );
}
