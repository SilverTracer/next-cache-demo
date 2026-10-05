import { cacheLife, cacheTag } from "next/cache";
import { cookies } from "next/headers";

import { simulateWork } from "@/lib/simulate";

export const DEMO_COOKIE = "demo-session";

/**
 * Regular `use cache`.
 * It CANNOT call cookies()/headers() or read searchParams itself - the
 * session value must be resolved outside this function and handed in as a
 * plain, serializable argument. From this function's point of view, a
 * cookie never existed; `session` is just a string, so the entry it
 * produces is shared storage keyed only by that string.
 */
export async function getSharedGreeting(session: string) {
  "use cache";
  cacheLife("minutes");
  cacheTag(`shared-greeting-${session}`);

  return await simulateWork(`shared:${session}`);
}

/**
 * `use cache: private`.
 * Allowed to call cookies() (and headers()) directly inside the cached
 * scope. The result is never written to a cache shared across requests or
 * users - only deduplicated for repeated calls within the same request, and
 * optionally kept in the visiting browser's client cache for `stale` seconds.
 */
export async function getPersonalGreeting() {
  "use cache: private";
  cacheLife({ stale: 60 });

  const session = (await cookies()).get(DEMO_COOKIE)?.value ?? "guest";
  return simulateWork(`private:${session}`);
}
