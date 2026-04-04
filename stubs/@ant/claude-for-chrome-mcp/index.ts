/**
 * Stub for @ant/claude-for-chrome-mcp
 * Chrome extension MCP server integration
 */

export const BROWSER_TOOLS = [
  'browser_navigate',
  'browser_click',
  'browser_type',
  'browser_screenshot',
  'browser_scroll',
  'browser_get_content',
] as const

export type BrowserTool = (typeof BROWSER_TOOLS)[number]

export interface ClaudeForChromeContext {
  getSocketPaths(): string[]
}

export interface Logger {
  info(msg: string, ...args: unknown[]): void
  error(msg: string, ...args: unknown[]): void
  debug(msg: string, ...args: unknown[]): void
  warn(msg: string, ...args: unknown[]): void
}

export type PermissionMode = 'allow' | 'deny' | 'prompt'

export function createClaudeForChromeServer(): never {
  throw new Error('@ant/claude-for-chrome-mcp is not available in stub mode')
}

export function createClaudeForChromeMcpServer(_options?: unknown): { close(): void } {
  console.warn('@ant/claude-for-chrome-mcp is stubbed - Chrome integration unavailable')
  return { close() {} }
}

export function runClaudeInChromeMcpServer(): Promise<never> {
  return Promise.reject(new Error('@ant/claude-for-chrome-mcp is not available in stub mode'))
}
