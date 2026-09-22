import type { ReactNode } from "react";

export function DemoLayout({
  title,
  summary,
  code,
  children,
}: Readonly<{
  title: string;
  summary: ReactNode;
  code: string;
  children: ReactNode;
}>) {
  return (
    <div className="demo-page">
      <h1>{title}</h1>
      <div className="demo-summary">{summary}</div>
      <pre className="code-block">
        <code>{code}</code>
      </pre>
      <div className="demo-result">{children}</div>
    </div>
  );
}
