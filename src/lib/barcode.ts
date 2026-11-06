import type { RenderOptions } from "bwip-js/browser";
import type { DiscountCard } from "./cards";

export function createBarcodeOptions(
  value: string,
  format: DiscountCard["format"],
  large = false,
): RenderOptions {
  return {
    bcid: format === "QR" ? "qrcode" : format === "EAN13" ? "ean13" : "code128",
    text: value,
    scale: 3,
    // bwip-js rejects a present height: undefined, even though its types allow it.
    ...(format === "QR"
      ? { eclevel: "M" as const }
      : { height: large ? 24 : 16 }),
    includetext: false,
    paddingwidth: 12,
    paddingheight: 8,
    backgroundcolor: "FFFFFF",
    barcolor: "000000",
  };
}
