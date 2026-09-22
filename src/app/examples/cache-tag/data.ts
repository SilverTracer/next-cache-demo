import { cacheLife, cacheTag } from "next/cache";

import { simulateWork } from "@/lib/simulate";

export const DEMO_TAG = "demo-tag";

export async function getTaggedData() {
  "use cache";
  cacheLife("hours");
  cacheTag(DEMO_TAG);

  return simulateWork("cache-tag");
}
