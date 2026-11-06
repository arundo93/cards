import type { TFunction } from "i18next";

const categoryKeys: Record<string, string> = {
  Покупки: "shopping",
  Продукты: "groceries",
  "Кофе и еда": "food",
  Красота: "beauty",
  Одежда: "clothing",
  Другое: "other",
};
/** Existing records keep their original category value, including custom labels. */
export function categoryLabel(value: string, t: TFunction): string {
  const key = Object.hasOwn(categoryKeys, value)
    ? categoryKeys[value]
    : undefined;
  return key ? t(`common.categories.${key}`) : value;
}
