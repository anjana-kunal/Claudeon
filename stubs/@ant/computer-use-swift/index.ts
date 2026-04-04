/**
 * Stub for @ant/computer-use-swift
 * macOS-only Swift bridge for computer use
 */

export interface ComputerUseAPI {
  screenshot(): Promise<Buffer>
  listWindows(): Promise<string[]>
  getFrontmostApp(): Promise<string>
}

export function getComputerUseAPI(): never {
  throw new Error('@ant/computer-use-swift is not available in stub mode')
}
