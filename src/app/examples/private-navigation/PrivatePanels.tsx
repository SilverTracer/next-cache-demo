import { ResultCard } from "@/components/ResultCard";

import {
  getRoutePrivateData,
  getSharedPrivateData,
  getUncachedData,
} from "./data";
import type { DemoRoute } from "./scenarios";

export async function PrivatePanels({ route }: { route: DemoRoute }) {
  const [shared, repeated, unique] = await Promise.all([
    getSharedPrivateData(),
    getSharedPrivateData(),
    getRoutePrivateData(route),
  ]);

  return (
    <section
      className="demo-result"
      aria-label={`Route ${route} private results`}
    >
      <h3 className="demo-subheading">Shared private function: two calls</h3>
      <ResultCard result={shared} />
      <ResultCard
        result={repeated}
        note={
          shared.id === repeated.id
            ? "Repeated call: same ID, deduplicated within this render."
            : "Repeated call: different ID, no deduplication observed."
        }
      />
      <h3 className="demo-subheading">Private function keyed by route</h3>
      <ResultCard result={unique} />
    </section>
  );
}

export async function UncachedPanels({ route }: { route: DemoRoute }) {
  const [uncached, uncachedRepeated] = await Promise.all([
    getUncachedData(),
    getUncachedData(),
  ]);

  return (
    <section
      className="demo-result"
      aria-label={`Route ${route} uncached results`}
    >
      <h3 className="demo-subheading">Shared uncached function: two calls</h3>
      <ResultCard result={uncached} />
      <ResultCard
        result={uncachedRepeated}
        note={
          uncached.id !== uncachedRepeated.id
            ? "Repeated call: different ID, each call executes independently on the server."
            : "Repeated call: same ID, independent execution not observed."
        }
      />
    </section>
  );
}
