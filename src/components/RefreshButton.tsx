"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

export function RefreshButton({
  label = "Refresh (soft navigation)",
}: Readonly<{ label?: string }>) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      className="button"
      disabled={isPending}
      onClick={() => startTransition(() => router.refresh())}
    >
      {isPending ? "Refreshing…" : label}
    </button>
  );
}
