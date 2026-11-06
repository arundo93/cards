import type { CardFormat } from "./cards";

export const STORE_PRESETS = [
  {
    id: "pyaterochka",
    name: "Пятёрочка",
    format: "EAN13",
    color: "#287a44",
    category: "Продукты",
  },
  {
    id: "magnit",
    name: "Магнит",
    format: "QR",
    color: "#b52d37",
    category: "Продукты",
  },
  {
    id: "lenta",
    name: "Лента",
    format: "CODE128",
    color: "#244788",
    category: "Продукты",
  },
  {
    id: "lemanapro",
    name: "Лемана ПРО",
    format: "CODE128",
    color: "#386d55",
    category: "Другое",
  },
] as const satisfies readonly {
  id: string;
  name: string;
  format: CardFormat;
  color: string;
  category: string;
}[];
export type StoreId = (typeof STORE_PRESETS)[number]["id"];
export function getStorePreset(id: string) {
  return STORE_PRESETS.find((store) => store.id === id);
}
