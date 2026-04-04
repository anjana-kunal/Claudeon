/**
 * Snip Compact - Stub for compaction service
 */

export interface SnipCompactOptions {
  maxTokens?: number
  preserveRecent?: number
}

export async function snipCompact(
  _messages: unknown[],
  _options?: SnipCompactOptions
): Promise<unknown[]> {
  // Stub - just returns messages unchanged
  return _messages
}

export function canSnipCompact(): boolean {
  return false
}
