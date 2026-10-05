export const SCENARIOS = [
  {
    label: "Private only / prefetch",
    routes: ["a", "b"],
    prefetch: true,
    content: "private",
  },
  {
    label: "Uncached only / prefetch",
    routes: ["c", "d"],
    prefetch: true,
    content: "uncached",
  },
  {
    label: "Mixed / prefetch",
    routes: ["e", "f"],
    prefetch: true,
    content: "mixed",
  },
  {
    label: "Mixed / no prefetch",
    routes: ["g", "h"],
    prefetch: false,
    content: "mixed",
  },
] as const;

export type DemoRoute = (typeof SCENARIOS)[number]["routes"][number];

export function getScenario(route: DemoRoute) {
  const scenario = SCENARIOS.find((candidate) =>
    candidate.routes.some((destination) => destination === route),
  );
  if (!scenario) {
    throw new Error("Unknown navigation demo route");
  }
  return scenario;
}
