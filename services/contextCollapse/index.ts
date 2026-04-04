/**
 * Context Collapse service - Stub
 */

export interface CollapseOptions {
  maxTokens?: number
  preserveSystem?: boolean
}

export async function collapseContext(
  _messages: unknown[],
  _options?: CollapseOptions
): Promise<unknown[]> {
  return _messages
}

export function shouldCollapse(_messages: unknown[]): boolean {
  return false
}
