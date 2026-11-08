import { appI18n } from "../i18n";
import { cardSchema, cardsSchema } from "./schemas";
import { getStorePreset, type StoreId } from "./stores";

export {
  MAX_CARD_NUMBER_LENGTH,
  MAX_CARDS,
} from "./schemas";
export type CardFormat = "CODE128" | "EAN13" | "QR";

export interface DiscountCard {
  id: string;
  name: string;
  number: string;
  format: CardFormat;
  color: string;
  category: string;
  notes: string;
  favorite: boolean;
  createdAt: string;
  updatedAt: string;
  storeId?: StoreId;
}

export const MAX_CODE128_LENGTH = 80;
export const MAX_QR_BYTES = 2000;
export const CARD_COLORS = [
  "#566C50",
  "#B66A4E",
  "#65738D",
  "#9A6B83",
  "#B49455",
  "#424B50",
];
export const CARD_CATEGORIES = [
  "Покупки",
  "Продукты",
  "Кофе и еда",
  "Красота",
  "Одежда",
  "Другое",
];

export function isValidEAN13(number: string): boolean {
  if (!/^\d{13}$/.test(number)) return false;
  const sum = [...number.slice(0, 12)].reduce(
    (total, digit, index) => total + Number(digit) * (index % 2 ? 3 : 1),
    0,
  );
  return (10 - (sum % 10)) % 10 === Number(number[12]);
}

export function completeEAN13(number: string): string {
  if (!/^\d{12}$/.test(number)) return number;
  const sum = [...number].reduce(
    (total, digit, index) => total + Number(digit) * (index % 2 ? 3 : 1),
    0,
  );
  return `${number}${(10 - (sum % 10)) % 10}`;
}

export function validateCard(value: unknown): DiscountCard {
  const card = cardSchema.validateSync(value, {
    abortEarly: true,
    strict: true,
  });
  const id = card.id;
  const name = card.name.trim();
  const format = card.format;
  const number = format === "EAN13" ? completeEAN13(card.number) : card.number;
  const store = card.storeId ? getStorePreset(card.storeId) : undefined;
  if (store && format !== store.format)
    throw new Error(appI18n.t("errors.store-format-mismatch"));
  if (format === "EAN13" && !isValidEAN13(number))
    throw new Error(appI18n.t("errors.invalid-ean13"));
  if (
    format === "CODE128" &&
    (!/^[\x20-\x7E]+$/.test(number) || number.length > MAX_CODE128_LENGTH)
  ) {
    throw new Error(appI18n.t("errors.code128", { max: MAX_CODE128_LENGTH }));
  }
  if (
    format === "QR" &&
    new TextEncoder().encode(number).byteLength > MAX_QR_BYTES
  ) {
    throw new Error(appI18n.t("errors.qr-length", { max: MAX_QR_BYTES }));
  }
  return {
    id,
    name,
    number,
    format,
    color: card.color,
    category: card.category,
    notes: card.notes,
    favorite: card.favorite,
    createdAt: card.createdAt,
    updatedAt: card.updatedAt,
    ...(store ? { storeId: store.id } : {}),
  };
}

export function validateCards(value: unknown): DiscountCard[] {
  const cards = cardsSchema
    .validateSync(value, { abortEarly: true, strict: true })
    .map(validateCard);
  if (new Set(cards.map((card) => card.id)).size !== cards.length)
    throw new Error(appI18n.t("errors.duplicate-ids"));
  return cards;
}
