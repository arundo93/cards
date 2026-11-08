import * as yup from "yup";
import { appI18n } from "../i18n";
import type { CardFormat } from "./cards";
import { STORE_PRESETS, type StoreId } from "./stores";

export const MAX_CARDS = 1000;
export const MAX_CARD_NUMBER_LENGTH = 1024;

function stringSchema(
  label: string,
  max: number,
  allowEmpty = false,
): yup.StringSchema<string> {
  const message = appI18n.t("errors.field", { label, max });
  let schema = yup
    .string()
    .typeError(message)
    .defined(message)
    .max(max, message);
  if (!allowEmpty)
    schema = schema.test("not-blank", message, (value) =>
      Boolean(value.trim()),
    );
  return schema;
}

const dateSchema = (label: string) =>
  stringSchema(label, 40).test(
    "valid-date",
    appI18n.t("errors.invalid-date"),
    (value) => Number.isFinite(Date.parse(value)),
  );

export const cardSchema = yup
  .object({
    id: stringSchema("ID", 100),
    name: stringSchema(appI18n.t("errors.name-label"), 80),
    number: stringSchema(
      appI18n.t("errors.number-label"),
      MAX_CARD_NUMBER_LENGTH,
    ),
    format: yup
      .mixed<CardFormat>()
      .oneOf(["CODE128", "EAN13", "QR"], appI18n.t("errors.unknown-format"))
      .required(appI18n.t("errors.unknown-format")),
    color: stringSchema(appI18n.t("errors.color-label"), 7).matches(
      /^#[0-9a-f]{6}$/i,
      appI18n.t("errors.invalid-color"),
    ),
    category: stringSchema(appI18n.t("errors.category-label"), 40, true),
    notes: stringSchema(appI18n.t("errors.notes-label"), 2000, true),
    favorite: yup
      .boolean()
      .typeError(appI18n.t("errors.invalid-favorite"))
      .required(appI18n.t("errors.invalid-favorite")),
    createdAt: dateSchema(appI18n.t("errors.created-at-label")),
    updatedAt: dateSchema(appI18n.t("errors.updated-at-label")),
    storeId: yup
      .mixed<StoreId>()
      .oneOf(
        STORE_PRESETS.map((store) => store.id),
        appI18n.t("errors.unknown-store"),
      )
      .optional(),
  })
  .typeError(appI18n.t("errors.invalid-card"))
  .required(appI18n.t("errors.invalid-card"));

export const cardsSchema = yup
  .array()
  .typeError(appI18n.t("errors.card-limit", { max: MAX_CARDS }))
  .max(MAX_CARDS, appI18n.t("errors.card-limit", { max: MAX_CARDS }))
  .required(appI18n.t("errors.card-limit", { max: MAX_CARDS }));
