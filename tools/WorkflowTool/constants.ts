/**
 * WorkflowTool constants - Stub
 */

export const WORKFLOW_TOOL_NAME = 'workflow'
export const WORKFLOW_MAX_STEPS = 100
export const WORKFLOW_TIMEOUT_MS = 300000

export const WorkflowStatus = {
  PENDING: 'pending',
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
} as const

export type WorkflowStatusType = (typeof WorkflowStatus)[keyof typeof WorkflowStatus]
