import { cacheLife } from "next/cache";

import { ResultCard } from "@/components/ResultCard";
import { simulateWork } from "@/lib/simulate";

export async function Widget() {
  "use cache";
  cacheLife("minutes");

  const data = await simulateWork("nested:widget");
  return <ResultCard result={data} note="Inner scope: cacheLife('minutes')." />;
}
