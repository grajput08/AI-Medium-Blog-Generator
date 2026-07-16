// Mock API client. Every UI hook goes through `mockFetch` so Phase 7 can
// replace this file with a real fetch wrapper without touching the hooks.

const MOCK_LATENCY_MS = 500;

export async function mockFetch<T>(produce: () => T): Promise<T> {
  await new Promise((r) => setTimeout(r, MOCK_LATENCY_MS));
  return produce();
}
