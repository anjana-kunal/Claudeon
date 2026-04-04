
// React Compiler Runtime shim
export function c(size) {
  const sentinel = Symbol.for('react.memo_cache_sentinel');
  return new Array(size).fill(sentinel);
}
export const $empty = Symbol.for('react.empty');
