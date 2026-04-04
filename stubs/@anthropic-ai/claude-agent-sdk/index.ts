/**
 * Stub for @anthropic-ai/claude-agent-sdk
 * Claude agent SDK types and utilities
 */

export interface AgentContext {
  sessionId: string
  workDir: string
}

export interface AgentMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface AgentTool {
  name: string
  description: string
  inputSchema: Record<string, unknown>
}

export interface AgentResponse {
  message: AgentMessage
  toolCalls?: Array<{
    name: string
    input: Record<string, unknown>
  }>
}

export class ClaudeAgent {
  constructor(_config: { apiKey?: string }) {}
  
  async chat(_messages: AgentMessage[]): Promise<AgentResponse> {
    throw new Error('ClaudeAgent stub - not implemented')
  }
}

export function createAgent(_config: { apiKey?: string }): ClaudeAgent {
  return new ClaudeAgent(_config)
}
