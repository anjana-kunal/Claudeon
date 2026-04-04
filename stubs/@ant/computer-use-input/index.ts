/**
 * Stub for @ant/computer-use-input
 * Native input handling for computer use
 */

export interface ComputerUseInput {
  click(x: number, y: number): Promise<void>
  doubleClick(x: number, y: number): Promise<void>
  move(x: number, y: number): Promise<void>
  key(key: string): Promise<void>
  keys(keys: string[]): Promise<void>
  type(text: string): Promise<void>
}

export function getInput(): never {
  throw new Error('@ant/computer-use-input is not available in stub mode')
}
