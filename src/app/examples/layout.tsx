import Link from "next/link";
import type { ReactNode } from "react";

export default function ExamplesLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div className="examples-shell">
      <div className="examples-topbar">
        <Link href="/" className="back-link">
          ← All examples
        </Link>
      </div>
      <main className="examples-content">{children}</main>
    </div>
  );
}
