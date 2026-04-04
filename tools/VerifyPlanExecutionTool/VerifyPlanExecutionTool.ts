/**
 * VerifyPlanExecutionTool - Stub
 */
import type { Tool } from '../../Tool.js'

export const VerifyPlanExecutionTool: Tool = {
  name: 'verify_plan_execution',
  description: 'Verify plan execution (not available in local builds)',
  inputSchema: {
    type: 'object',
    properties: {},
    required: [],
  },
  async call() {
    return {
      type: 'result',
      data: 'VerifyPlanExecutionTool is not available in local builds',
    }
  },
}
