/**
 * SDK Tool Types - Generated stub
 */

export interface ToolDefinition {
  name: string
  description: string
  inputSchema: Record<string, unknown>
}

export interface ToolResult {
  type: 'success' | 'error'
  data?: unknown
  error?: string
}

export type ToolHandler = (input: unknown) => Promise<ToolResult>
