/**
 * Modifiers NAPI stub
 * Native module for keyboard modifier detection
 */

export interface ModifierState {
  shift: boolean
  ctrl: boolean
  alt: boolean
  meta: boolean
}

export function getModifiers(): ModifierState {
  return {
    shift: false,
    ctrl: false,
    alt: false,
    meta: false,
  }
}

export function isModifierPressed(modifier: keyof ModifierState): boolean {
  return false
}
