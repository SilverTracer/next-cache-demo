import { cacheLife, cacheTag } from "next/cache";

import { ResultCard } from "@/components/ResultCard";
import { simulateWork } from "@/lib/simulate";

// Cached per `id` - the component's props are part of its cache key, so
// each product page gets its own independent, long-lived entry.
export async function ProductDetails({ id }: Readonly<{ id: string }>) {
  "use cache";
  cacheLife("hours");
  cacheTag(`product-${id}`);

  const data = await simulateWork(`product-details:${id}`);
  return <ResultCard result={data} note={`Cached per id="${id}" for hours.`} />;
}
