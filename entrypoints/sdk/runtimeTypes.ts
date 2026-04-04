/**
 * SDK Runtime Types - Generated stub
 */

export interface RuntimeContext {
  sessionId: string
  workDir: string
}

export interface RuntimeMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface RuntimeTool {
  name: string
  description: string
  inputSchema: Record<string, unknown>
}

export type RuntimeCallback = (event: unknown) => void
