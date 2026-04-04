/**
 * Stub for @ant/computer-use-mcp
 * This is an internal Anthropic package for computer use functionality
 */

export interface ComputerUseSessionContext {
  sessionId: string
  workDir: string
}

export interface CuCallToolResult {
  success: boolean
  output?: string
  error?: string
}

export interface CuPermissionRequest {
  tool: string
  args: Record<string, unknown>
}

export interface CuPermissionResponse {
  allowed: boolean
  reason?: string
}

export interface ScreenshotDims {
  width: number
  height: number
}

export interface CoordinateMode {
  type: 'absolute' | 'relative'
}

export interface CuSubGates {
  allowScreenshot: boolean
  allowMouse: boolean
  allowKeyboard: boolean
}

export const DEFAULT_GRANT_FLAGS = {
  allowScreenshot: false,
  allowMouse: false,
  allowKeyboard: false,
}

export const API_RESIZE_PARAMS = {
  maxWidth: 1920,
  maxHeight: 1080,
}

export function bindSessionContext(ctx: ComputerUseSessionContext): void {
  // Stub implementation
}

export function buildComputerUseTools(): never[] {
  return []
}

export function targetImageSize(width: number, height: number): ScreenshotDims {
  return { width, height }
}

export function getSentinelCategory(_appName: string): string | null {
  return null
}
