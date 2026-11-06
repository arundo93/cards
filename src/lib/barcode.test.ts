import bwipjs from "bwip-js/node";
import { describe, expect, it } from "vitest";
import { createBarcodeOptions } from "./barcode";
import type { DiscountCard } from "./cards";

describe("barcode rendering", () => {
  const samples: { format: DiscountCard["format"]; value: string }[] = [
    { format: "CODE128", value: "000012345678" },
    { format: "EAN13", value: "4601234567893" },
    { format: "QR", value: "https://example.com/card/000012345678" },
    { format: "QR", value: "Карта лояльности · 東京 🎉" },
  ];

  for (const large of [false, true]) {
    it.each(samples)(
      `renders $format ($value), large=${large}`,
      ({ format, value }) => {
        // Invoke the actual shared BWIPP encoder, not a mocked options consumer.
        const svg = bwipjs.toSVG(createBarcodeOptions(value, format, large));
        expect(svg).toContain("<svg");
        expect(svg).toContain("<path");
        expect(svg).toMatch(/viewBox="0 0 [1-9]\d* [1-9]\d*"/);
      },
    );
  }

  it("omits undefined QR options that the encoder rejects at runtime", () => {
    const options = createBarcodeOptions("QR regression", "QR");
    expect(options).not.toHaveProperty("height");
    expect(() => bwipjs.toSVG({ ...options, height: undefined })).toThrow();
    expect(() => bwipjs.toSVG(options)).not.toThrow();
  });

  it("rejects an incorrect EAN13 check digit instead of silently encoding another number", () => {
    expect(() =>
      bwipjs.toSVG(createBarcodeOptions("4601234567890", "EAN13")),
    ).toThrow();
  });
});
