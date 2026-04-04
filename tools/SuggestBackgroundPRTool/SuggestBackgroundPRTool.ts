/**
 * SuggestBackgroundPRTool - Stub
 */
import type { Tool } from '../../Tool.js'

export const SuggestBackgroundPRTool: Tool = {
  name: 'suggest_background_pr',
  description: 'Suggest creating a background PR (not available in local builds)',
  inputSchema: {
    type: 'object',
    properties: {},
    required: [],
  },
  async call() {
    return {
      type: 'result',
      data: 'SuggestBackgroundPRTool is not available in local builds',
    }
  },
}
