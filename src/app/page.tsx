import Link from "next/link";

const examples = [
  {
    href: "/examples/function-level",
    title: "1. Function-level `use cache`",
    description: "Cache the return value of a plain async function.",
  },
  {
    href: "/examples/component-level",
    title: "2. Component-level `use cache`",
    description: "Cache a component's rendered output, keyed by its props.",
  },
  {
    href: "/examples/file-level",
    title: "3. File-level `use cache`",
    description:
      "Put the directive at the top of a file to cache every export.",
  },
  {
    href: "/examples/cache-life-presets",
    title: "4. `cacheLife` presets",
    description:
      "Compare the built-in seconds/minutes/hours/days/weeks/max profiles.",
  },
  {
    href: "/examples/custom-profile",
    title: "5. Custom `cacheLife` profile",
    description:
      "Define a reusable profile in next.config.ts and reference it by name.",
  },
  {
    href: "/examples/inline-profile",
    title: "6. Inline `cacheLife` profile",
    description:
      "Pass a one-off { stale, revalidate, expire } object directly.",
  },
  {
    href: "/examples/cache-tag",
    title: "7. `cacheTag` + on-demand invalidation",
    description: "Tag a cache entry and purge it on demand with revalidateTag.",
  },
  {
    href: "/examples/nested-caching",
    title: "8. Nested `use cache` scopes",
    description:
      "See how an explicit outer cacheLife overrides inner lifetimes.",
  },
  {
    href: "/examples/conditional-lifetime",
    title: "9. Conditional cache lifetime",
    description:
      "Call cacheLife with a different profile depending on the data.",
  },
  {
    href: "/examples/dynamic-segment/1",
    title: "10. Dynamic route segment + cached components",
    description:
      "A [id] route where some components are cached per id and others aren't.",
  },
];

export default function Home() {
  return (
    <div className="home-page">
      <header className="home-header">
        <h1>
          <code>use cache</code> directive — live demo
        </h1>
        <p>
          A tour of the Next.js <code>&quot;use cache&quot;</code> directive,
          the <code>cacheLife</code> and <code>cacheTag</code> APIs, and
          on-demand revalidation. Enabled via <code>cacheComponents: true</code>{" "}
          in <code>next.config.ts</code>.
        </p>
      </header>
      <ul className="example-list">
        {examples.map((example) => (
          <li key={example.href}>
            <Link href={example.href} className="example-card">
              <span className="example-card-title">{example.title}</span>
              <span className="example-card-description">
                {example.description}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
