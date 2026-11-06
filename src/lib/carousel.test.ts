import { describe, expect, it } from "vitest";
import { virtualSlots, wrapIndex } from "./carousel";

describe("infinite virtual track", () => {
  it.each([2, 3, 4, 20])(
    "keeps every surviving slot at the same location when recycling (%i cards)",
    (count) => {
      for (const direction of [-1, 1]) {
        for (const cursor of [-20, -1, 0, count - 1, count, 20]) {
          const moving = virtualSlots(cursor, direction, count);
          const settled = virtualSlots(cursor + direction, 0, count);
          for (const slot of moving.filter(
            (slot) => slot.visible && Math.abs(slot.to) <= (count < 3 ? 0 : 1),
          )) {
            const survivor = settled.find(
              (candidate) => candidate.key === slot.key,
            );
            expect(survivor?.index).toBe(slot.index);
            expect(survivor?.to).toBe(slot.to);
          }
          const incoming = moving.find((slot) => slot.to === 0);
          expect(incoming?.index).toBe(wrapIndex(cursor + direction, count));
        }
      }
    },
  );

  it("uses unique virtual keys even when three cards repeat in five slots", () => {
    const slots = virtualSlots(2, 1, 3);
    expect(new Set(slots.map((slot) => slot.key)).size).toBe(5);
    expect(new Set(slots.map((slot) => slot.index)).size).toBe(3);
    expect(slots.find((slot) => slot.to === 0)?.index).toBe(0);
  });

  it.each([1, 2, 3, 8])(
    "shows the exact required count at rest (%i cards)",
    (count) => {
      expect(
        virtualSlots(0, 0, count).filter((slot) => slot.visible),
      ).toHaveLength(count < 3 ? 1 : 3);
    },
  );

  it("does not render slots for an empty wallet", () => {
    expect(virtualSlots(0, 0, 0)).toEqual([]);
  });
});
