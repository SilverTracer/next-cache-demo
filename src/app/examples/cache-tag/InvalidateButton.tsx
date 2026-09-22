"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { invalidateDemoTag } from "./actions";

export function InvalidateButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      className="button"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await invalidateDemoTag();
          router.refresh();
        })
      }
    >
      {isPending ? "Invalidating…" : "Invalidate 'demo-tag' now"}
    </button>
  );
}
