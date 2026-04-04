/**
 * TungstenTool - Stub for internal Anthropic tool
 */
import type { Tool } from '../../Tool.js'

export const TungstenTool: Tool = {
  name: 'tungsten',
  description: 'Internal Anthropic tool (not available in local builds)',
  inputSchema: {
    type: 'object',
    properties: {},
    required: [],
  },
  async call() {
    return {
      type: 'result',
      data: 'TungstenTool is not available in local builds',
    }
  },
}

export function clearTungstenCache(): void {
  // Stub
}
