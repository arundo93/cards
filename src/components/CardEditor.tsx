import { CheckShapeFill } from "@gravity-ui/icons";
import { Button, Icon, Text, TextArea, TextInput } from "@gravity-ui/uikit";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  CARD_CATEGORIES,
  CARD_COLORS,
  type DiscountCard,
  MAX_CARD_NUMBER_LENGTH,
  validateCard,
} from "../lib/cards";
import { categoryLabel } from "../lib/categories";
import { getStorePreset, STORE_PRESETS } from "../lib/stores";
import shared from "../styles/shared.module.css";
import { Barcode } from "./Barcode";
import styles from "./CardEditor.module.css";
import { Dialog } from "./Dialog";

export function CardEditor({
  card,
  onClose,
  onSave,
}: {
  card?: DiscountCard;
  onClose: () => void;
  onSave: (card: DiscountCard) => Promise<void>;
}) {
  const { t } = useTranslation();
  const [mode, setMode] = useState<"store" | "manual">(
    card && !card.storeId ? "manual" : "store",
  );
  const [storeId, setStoreId] = useState<string>(card?.storeId ?? "");
  const [name, setName] = useState(card?.name ?? "");
  const [number, setNumber] = useState(card?.number ?? "");
  const [format, setFormat] = useState<DiscountCard["format"]>(
    card?.format ?? "CODE128",
  );
  const [color, setColor] = useState(card?.color ?? CARD_COLORS[0]);
  const [category, setCategory] = useState(card?.category ?? "Покупки");
  const [notes, setNotes] = useState(card?.notes ?? "");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const preset = mode === "store" ? getStorePreset(storeId) : undefined;
  const selectedFormat = preset?.format ?? format;
  const isSelectedColor = (value: string) =>
    value.toLowerCase() === color.toLowerCase();
  const palette = CARD_COLORS.some(isSelectedColor)
    ? CARD_COLORS
    : [...CARD_COLORS, color];
  function selectStore(id: string) {
    setStoreId(id);
    setError("");
    const store = getStorePreset(id);
    if (store) {
      setColor(store.color);
      setCategory(store.category);
    }
  }
  function changeMode(next: "store" | "manual") {
    if (next === "manual" && preset) {
      setName((current) => current || preset.name);
      setFormat(preset.format);
    }
    setMode(next);
    setError("");
  }
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    try {
      if (mode === "store" && !preset)
        throw new Error(t("editor.choose-store"));
      const now = new Date().toISOString();
      const next = validateCard({
        id: card?.id ?? crypto.randomUUID(),
        name: preset?.name ?? name,
        number,
        format: selectedFormat,
        color,
        category,
        notes,
        favorite: card?.favorite ?? false,
        createdAt: card?.createdAt ?? now,
        updatedAt: now,
        ...(preset ? { storeId: preset.id } : {}),
      });
      setBusy(true);
      await onSave(next);
    } catch (error) {
      setError(error instanceof Error ? error.message : t("editor.save-error"));
    } finally {
      setBusy(false);
    }
  }
  return (
    <Dialog
      title={t(card ? "editor.edit-title" : "editor.create-title")}
      onClose={() => !busy && onClose()}
    >
      <Text as="p" variant="body-1" className={styles.muted}>
        {t("editor.description")}
      </Text>
      <form onSubmit={submit} className={styles["editor-form"]}>
        <fieldset className={styles["card-source"]}>
          <Text as="legend" variant="body-1">
            {t("editor.source-label")}
          </Text>
          <div className={styles["source-options"]}>
            <Text
              as="label"
              variant="body-1"
              className={
                mode === "store"
                  ? `${styles["source-option"]} ${styles.selected}`
                  : styles["source-option"]
              }
            >
              <input
                type="radio"
                name="card-source"
                value="store"
                checked={mode === "store"}
                onChange={() => changeMode("store")}
                disabled={busy}
              />
              {t("editor.store-mode")}
            </Text>
            <Text
              as="label"
              variant="body-1"
              className={
                mode === "manual"
                  ? `${styles["source-option"]} ${styles.selected}`
                  : styles["source-option"]
              }
            >
              <input
                type="radio"
                name="card-source"
                value="manual"
                checked={mode === "manual"}
                onChange={() => changeMode("manual")}
                disabled={busy}
              />
              {t("editor.manual-mode")}
            </Text>
          </div>
        </fieldset>
        {mode === "store" ? (
          <Text as="label" variant="body-1" htmlFor="card-store">
            {t("editor.store-label")}
            <select
              id="card-store"
              value={storeId}
              onChange={(event) => selectStore(event.target.value)}
              disabled={busy}
              required
            >
              <option value="" disabled>
                {t("editor.store-placeholder")}
              </option>
              {STORE_PRESETS.map((store) => (
                <option key={store.id} value={store.id}>
                  {t(`editor.stores.${store.id}`)}
                </option>
              ))}
            </select>
          </Text>
        ) : (
          <>
            <Text as="label" variant="body-1" htmlFor="card-name">
              {t("editor.name")}
              <TextInput
                id="card-name"
                value={name}
                onUpdate={setName}
                placeholder={t("editor.name-placeholder")}
                size="xl"
                controlProps={{ maxLength: 80, required: true }}
                disabled={busy}
              />
            </Text>
            <Text as="label" variant="body-1" htmlFor="card-format">
              {t("editor.format")}
              <select
                id="card-format"
                value={format}
                onChange={(event) =>
                  setFormat(event.target.value as DiscountCard["format"])
                }
                disabled={busy}
              >
                {(["CODE128", "EAN13", "QR"] as const).map((value) => (
                  <option key={value} value={value}>
                    {t(`editor.formats.${value.toLowerCase()}`)}
                  </option>
                ))}
              </select>
            </Text>
          </>
        )}
        {preset && (
          <Text as="p" variant="body-1" className={styles["preset-hint"]}>
            {t("editor.preset-hint", {
              store: t(`editor.stores.${preset.id}`),
              format: t(`editor.formats.${preset.format.toLowerCase()}`),
            })}
          </Text>
        )}
        <Text as="label" variant="body-1" htmlFor="card-number">
          {t("editor.number")}
          <TextInput
            id="card-number"
            value={number}
            onUpdate={setNumber}
            placeholder={t("editor.number-placeholder")}
            size="xl"
            controlProps={{
              maxLength: MAX_CARD_NUMBER_LENGTH,
              required: true,
              inputMode: selectedFormat === "EAN13" ? "numeric" : "text",
            }}
            disabled={busy}
          />
        </Text>
        {(mode === "manual" || preset) && (
          <Text as="p" variant="caption-2" className={shared["field-help"]}>
            {t(`editor.hints.${selectedFormat.toLowerCase()}`)}
          </Text>
        )}
        <Text as="label" variant="body-1" htmlFor="card-category">
          {t("editor.category")}
          <select
            id="card-category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            disabled={busy}
          >
            {[...new Set([category, ...CARD_CATEGORIES])].map((value) => (
              <option key={value} value={value}>
                {categoryLabel(value, t)}
              </option>
            ))}
          </select>
        </Text>
        <fieldset className={styles["color-picker"]}>
          <Text as="legend" variant="body-1">
            {t("editor.color")}
          </Text>
          {palette.map((value) => (
            <button
              type="button"
              key={value}
              aria-label={t("editor.color-option", { color: value })}
              aria-pressed={isSelectedColor(value)}
              style={{ background: value }}
              className={isSelectedColor(value) ? styles.selected : ""}
              onClick={() => setColor(value)}
              disabled={busy}
            >
              {isSelectedColor(value) ? (
                <Icon data={CheckShapeFill} size={17} />
              ) : null}
            </button>
          ))}
        </fieldset>
        <Text as="label" variant="body-1" htmlFor="card-notes">
          {t("editor.notes")}{" "}
          <Text as="span" variant="inherit" className={styles.muted}>
            · {t("editor.optional")}
          </Text>
          <TextArea
            id="card-notes"
            value={notes}
            onUpdate={setNotes}
            placeholder={t("editor.notes-placeholder")}
            rows={2}
            controlProps={{ maxLength: 2000 }}
            disabled={busy}
          />
        </Text>
        {number && (mode === "manual" || preset) && (
          <div className={styles["editor-preview"]}>
            <Barcode value={number} format={selectedFormat} />
          </div>
        )}
        {error && (
          <Text as="p" variant="body-1" className={shared.error} role="alert">
            {error}
          </Text>
        )}
        <div className={shared["dialog-actions"]}>
          <Button size="xl" view="flat" onClick={onClose} disabled={busy}>
            {t("editor.cancel")}
          </Button>
          <Button type="submit" view="action" size="xl" loading={busy}>
            {t("editor.save")}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
