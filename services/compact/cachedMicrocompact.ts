/**
 * Cached Microcompact - Stub
 */

export interface MicrocompactCache {
  get(key: string): unknown | undefined
  set(key: string, value: unknown): void
  clear(): void
}

export function createMicrocompactCache(): MicrocompactCache {
  const cache = new Map<string, unknown>()
  return {
    get: (key) => cache.get(key),
    set: (key, value) => cache.set(key, value),
    clear: () => cache.clear(),
  }
}

export async function cachedMicrocompact(
  _input: string,
  _options?: unknown
): Promise<string> {
  return _input
}
