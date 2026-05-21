/** Run after the current effect tick (avoids react-hooks/set-state-in-effect). */
export function deferEffect(fn: () => void) {
  queueMicrotask(fn);
}
