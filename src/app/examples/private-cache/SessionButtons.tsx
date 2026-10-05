"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { setDemoSession } from "./actions";

export function SessionButtons() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function set(value: string) {
    startTransition(async () => {
      await setDemoSession(value);
      router.refresh();
    });
  }

  return (
    <div className="button-row">
      <button
        className="button"
        disabled={isPending}
        onClick={() => set("alice")}
      >
        Set cookie: session=alice
      </button>
      <button
        className="button"
        disabled={isPending}
        onClick={() => set("bob")}
      >
        Set cookie: session=bob
      </button>
      <button className="button" disabled={isPending} onClick={() => set("")}>
        Clear cookie
      </button>
    </div>
  );
}
