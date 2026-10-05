"use server";

import { revalidatePath, updateTag } from "next/cache";

import { LAYOUT_TAG } from "./data";
import { type DemoRoute, getScenario } from "./scenarios";

export async function invalidateRoute(route: DemoRoute) {
  getScenario(route);
  revalidatePath(`/examples/private-navigation/${route}`);
}

export async function invalidateLayout() {
  updateTag(LAYOUT_TAG);
}
