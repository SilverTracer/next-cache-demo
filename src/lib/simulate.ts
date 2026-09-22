/**
 * Stands in for a slow data source (DB query, external API, etc).
 * Every call generates a fresh id + timestamp so it's obvious in the UI
 * whether a value came from cache (unchanged) or was recomputed (changed).
 */
export async function simulateWork(label: string, delayMs = 700) {
  await new Promise((resolve) => setTimeout(resolve, delayMs));

  return {
    label,
    id: crypto.randomUUID().slice(0, 8),
    generatedAt: new Date().toISOString(),
  };
}

export type WorkResult = Awaited<ReturnType<typeof simulateWork>>;
