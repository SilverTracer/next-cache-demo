import { cacheLife, cacheTag } from "next/cache";
import { cookies } from "next/headers";

import { simulateWork } from "@/lib/simulate";

import { DEMO_COOKIE } from "../private-cache/data";
import type { DemoRoute } from "./scenarios";

export const LAYOUT_TAG = "private-navigation-layout";
export const PRIVATE_STALE_SECONDS = 60;

export async function getLayoutData() {
  "use cache";
  cacheLife({ stale: 300, revalidate: 3600, expire: 86400 });
  cacheTag(LAYOUT_TAG);

  return simulateWork("shared layout: public data");
}

export async function getSharedPrivateData() {
  "use cache: private";
  cacheLife({ stale: PRIVATE_STALE_SECONDS });

  const session = (await cookies()).get(DEMO_COOKIE)?.value ?? "guest";
  const result = await simulateWork(`shared private read: session=${session}`);
  console.info("[private-navigation]", result);
  return result;
}

export async function getRoutePrivateData(route: DemoRoute) {
  "use cache: private";
  cacheLife({ stale: PRIVATE_STALE_SECONDS });

  const session = (await cookies()).get(DEMO_COOKIE)?.value ?? "guest";
  const result = await simulateWork(`route ${route}: session=${session}`);
  console.info("[private-navigation]", result);
  return result;
}

export async function getUncachedData() {
  const session = (await cookies()).get(DEMO_COOKIE)?.value ?? "guest";
  const result = await simulateWork(`uncached read: session=${session}`);
  console.info("[private-navigation]", result);
  return result;
}
