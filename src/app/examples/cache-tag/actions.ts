"use server";

import { updateTag } from "next/cache";

import { DEMO_TAG } from "./data";

export async function invalidateDemoTag() {
  // updateTag gives read-your-own-writes semantics: the very next read
  // after this Server Action returns sees fresh data immediately.
  updateTag(DEMO_TAG);
}
