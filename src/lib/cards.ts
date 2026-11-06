import { appI18n } from "../i18n";
import { getStorePreset, type StoreId } from "./stores";
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

export const MAX_CARDS = 1000;
export const MAX_CARD_NUMBER_LENGTH = 1024;
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

function stringField(
  value: unknown,
  label: string,
  max: number,
  allowEmpty = false,
): string {
  if (
    typeof value !== "string" ||
    value.length > max ||
    (!allowEmpty && !value.trim())
  ) {
    throw new Error(appI18n.t("errors.field", { label, max }));
  }
  return value;
}

export function isValidEAN13(number: string): boolean {
  if (!/^\d{13}$/.test(number)) return false;
  const sum = [...number.slice(0, 12)].reduce(
    (total, digit, index) => total + Number(digit) * (index % 2 ? 3 : 1),
    0,
  );
  return (10 - (sum % 10)) % 10 === Number(number[12]);
}

export function validateCard(value: unknown): DiscountCard {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error(appI18n.t("errors.invalid-card"));
  const card = value as Record<string, unknown>;
  const id = stringField(card.id, "ID", 100);
  const name = stringField(
    card.name,
    appI18n.t("errors.name-label"),
    80,
  ).trim();
  const number = stringField(
    card.number,
    appI18n.t("errors.number-label"),
    MAX_CARD_NUMBER_LENGTH,
  );
  if (!["CODE128", "EAN13", "QR"].includes(String(card.format)))
    throw new Error(appI18n.t("errors.unknown-format"));
  const format = card.format as CardFormat;
  const store =
    typeof card.storeId === "string" ? getStorePreset(card.storeId) : undefined;
  if (card.storeId !== undefined && !store)
    throw new Error(appI18n.t("errors.unknown-store"));
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
  const color = stringField(card.color, appI18n.t("errors.color-label"), 7);
  if (!/^#[0-9a-f]{6}$/i.test(color))
    throw new Error(appI18n.t("errors.invalid-color"));
  const category = stringField(
    card.category,
    appI18n.t("errors.category-label"),
    40,
    true,
  );
  const notes = stringField(
    card.notes,
    appI18n.t("errors.notes-label"),
    2000,
    true,
  );
  if (typeof card.favorite !== "boolean")
    throw new Error(appI18n.t("errors.invalid-favorite"));
  const createdAt = stringField(
    card.createdAt,
    appI18n.t("errors.created-at-label"),
    40,
  );
  const updatedAt = stringField(
    card.updatedAt,
    appI18n.t("errors.updated-at-label"),
    40,
  );
  if (
    !Number.isFinite(Date.parse(createdAt)) ||
    !Number.isFinite(Date.parse(updatedAt))
  )
    throw new Error(appI18n.t("errors.invalid-date"));
  return {
    id,
    name,
    number,
    format,
    color,
    category,
    notes,
    favorite: card.favorite,
    createdAt,
    updatedAt,
    ...(store ? { storeId: store.id } : {}),
  };
}

export function validateCards(value: unknown): DiscountCard[] {
  if (!Array.isArray(value) || value.length > MAX_CARDS)
    throw new Error(appI18n.t("errors.card-limit", { max: MAX_CARDS }));
  const cards = value.map(validateCard);
  if (new Set(cards.map((card) => card.id)).size !== cards.length)
    throw new Error(appI18n.t("errors.duplicate-ids"));
  return cards;
}
