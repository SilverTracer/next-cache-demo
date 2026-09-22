import { ResultCard } from "@/components/ResultCard";
import { simulateWork } from "@/lib/simulate";

// Deliberately NOT cached - runs fresh on every request so it can be
// contrasted with the cached <ProductDetails> next to it.
export async function LiveStock({ id }: Readonly<{ id: string }>) {
  const data = await simulateWork(`live-stock:${id}`, 200);
  return <ResultCard result={data} note="Uncached - recomputed on every request." />;
}
