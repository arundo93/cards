export function wrapIndex(index: number, length: number): number {
  return length ? ((index % length) + length) % length : 0;
}

/** Virtual keys belong to positions in an unbounded track, never card IDs. */
export function virtualSlots(
  cursor: number,
  direction: number,
  length: number,
) {
  if (!length) return [];
  const offsets = length === 1 ? [0] : [-2, -1, 0, 1, 2];
  const visibleRadius = length < 3 ? 0 : 1;
  return offsets.map((from) => ({
    key: cursor + from,
    index: wrapIndex(cursor + from, length),
    from,
    to: from - direction,
    visible:
      Math.abs(from) <= visibleRadius ||
      Math.abs(from - direction) <= visibleRadius,
  }));
}
