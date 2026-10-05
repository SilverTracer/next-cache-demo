"use server";

import { cookies } from "next/headers";

import { DEMO_COOKIE } from "./data";

export async function setDemoSession(value: string) {
  const store = await cookies();

  if (value) {
    store.set(DEMO_COOKIE, value);
  } else {
    store.delete(DEMO_COOKIE);
  }
}
