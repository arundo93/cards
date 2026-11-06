import { describe, expect, it } from "vitest";
import { type DiscountCard, isValidEAN13, validateCards } from "./cards";
import { getStorePreset, STORE_PRESETS } from "./stores";

const exampleCard: DiscountCard = {
  id: "test-card",
  name: "Магазин",
  number: "000012345678",
  format: "CODE128",
  color: "#566C50",
  category: "Покупки",
  notes: "",
  favorite: false,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

describe("card validation", () => {
  it("contains exactly the four requested store-to-format mappings", () => {
    expect(STORE_PRESETS.map(({ id, format }) => [id, format])).toEqual([
      ["pyaterochka", "EAN13"],
      ["magnit", "QR"],
      ["lenta", "CODE128"],
      ["lemanapro", "CODE128"],
    ]);
  });
  it.each([
    ["pyaterochka", "4006381333931"],
    ["magnit", "Моя карта Магнит №00042"],
    ["lenta", "000123456789"],
    ["lemanapro", "LM-00012345"],
  ])(
    "validates the requested %s code without changing its content",
    (id, number) => {
      const store = getStorePreset(id);
      if (!store) throw new Error("Missing fixture store");
      const [card] = validateCards([
        {
          ...exampleCard,
          storeId: store.id,
          name: store.name,
          format: store.format,
          number,
        },
      ]);
      expect(card.storeId).toBe(id);
      expect(card.number).toBe(number);
      expect(card.format).toBe(store.format);
    },
  );
  it("preserves legacy cards and validates optional store identity and format", () => {
    expect(validateCards([exampleCard])[0]).not.toHaveProperty("storeId");
    expect(
      validateCards([{ ...exampleCard, storeId: "lenta" }])[0].storeId,
    ).toBe("lenta");
    expect(() =>
      validateCards([{ ...exampleCard, storeId: "unknown" }]),
    ).toThrow("Неизвестный магазин");
    expect(() =>
      validateCards([{ ...exampleCard, storeId: "magnit" }]),
    ).toThrow("Формат кода");
  });
  it("keeps leading zeroes and strips unknown fields", () => {
    expect(validateCards([{ ...exampleCard, extra: "untrusted" }])).toEqual([
      exampleCard,
    ]);
  });
  it("rejects duplicate identifiers and malformed imports", () => {
    expect(() => validateCards([exampleCard, exampleCard])).toThrow(
      "одинаковыми ID",
    );
    expect(() =>
      validateCards([{ ...exampleCard, favorite: "false" }]),
    ).toThrow();
    expect(() =>
      validateCards([{ ...exampleCard, color: "url(x)" }]),
    ).toThrow();
    expect(() =>
      validateCards([{ ...exampleCard, format: "unknown" }]),
    ).toThrow();
    expect(() => validateCards([{ ...exampleCard, number: 123 }])).toThrow();
  });
  it("checks EAN13 checksum and rejects unsupported CODE128 characters", () => {
    expect(isValidEAN13("4006381333931")).toBe(true);
    expect(isValidEAN13("4006381333932")).toBe(false);
    expect(isValidEAN13("400638133393")).toBe(false);
    expect(() => validateCards([{ ...exampleCard, number: "Текст" }])).toThrow(
      "CODE128",
    );
    expect(
      validateCards([{ ...exampleCard, format: "QR", number: "Текст" }]),
    ).toHaveLength(1);
  });
  it("limits QR content by encoded bytes so accepted Unicode fits the renderer", () => {
    expect(() =>
      validateCards([
        { ...exampleCard, format: "QR", number: "漢".repeat(1024) },
      ]),
    ).toThrow("Текст слишком длинный");
    expect(
      validateCards([
        { ...exampleCard, format: "QR", number: "я".repeat(1000) },
      ]),
    ).toHaveLength(1);
    expect(() =>
      validateCards([
        { ...exampleCard, format: "QR", number: "я".repeat(1001) },
      ]),
    ).toThrow("Текст слишком длинный");
    expect(
      validateCards([
        { ...exampleCard, format: "QR", number: "a".repeat(1024) },
      ]),
    ).toHaveLength(1);
  });
});
