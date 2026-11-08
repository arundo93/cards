import { ArrowDownToLine, ShieldCheck } from "@gravity-ui/icons";
import { Button, Icon, Text, TextInput } from "@gravity-ui/uikit";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { exportBackup, importBackup, MAX_BACKUP_BYTES } from "../lib/backup";
import type { DiscountCard } from "../lib/cards";
import { requestPersistentStorage } from "../lib/storage";
import shared from "../styles/shared.module.css";
import styles from "./BackupPanel.module.css";
export function BackupPanel({
  cards,
  onImport,
  notify,
  recovery = false,
}: {
  cards: DiscountCard[];
  onImport: (cards: DiscountCard[]) => Promise<void>;
  notify: (s: string) => void;
  recovery?: boolean;
}) {
  const { t } = useTranslation();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState<DiscountCard[] | null>(null);
  const file = useRef<HTMLInputElement>(null);
  async function download() {
    setBusy(true);
    setError("");
    try {
      const data = await exportBackup(cards, password || undefined);
      const url = URL.createObjectURL(
        new Blob([data], { type: "application/json" }),
      );
      const a = document.createElement("a");
      a.href = url;
      a.download = `discount-cards-${new Date().toISOString().slice(0, 10)}${password ? "-encrypted" : ""}.json`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      notify(t("components.backup.downloaded"));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function read(file: File) {
    setBusy(true);
    setError("");
    setPending(null);
    try {
      if (file.size > MAX_BACKUP_BYTES)
        throw new Error(t("components.backup.file-too-large"));
      setPending(await importBackup(await file.text(), password || undefined));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function merge() {
    if (!pending) return;
    setBusy(true);
    setError("");
    try {
      const merged = new Map(cards.map((c) => [c.id, c]));
      for (const card of pending) {
        const old = merged.get(card.id);
        if (!old || Date.parse(card.updatedAt) > Date.parse(old.updatedAt))
          merged.set(card.id, card);
      }
      await onImport([...merged.values()]);
      setPending(null);
      notify(t("components.backup.restored"));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className={styles["settings-stack"]}>
      {!recovery && (
        <section className={styles["settings-card"]}>
          <div className={styles["section-icon"]}>
            <Icon data={ShieldCheck} size={22} />
          </div>
          <Text as="h2" variant="header-1">
            {t("components.backup.privacy-title")}
          </Text>
          <Text as="p" variant="body-1">
            {t("components.backup.privacy-description")}
          </Text>
          <Text as="div" variant="caption-2" className={styles["storage-note"]}>
            <span className={shared["status-dot"]} />
            {t("components.backup.on-device", { count: cards.length })}
          </Text>
          <Button
            size="l"
            view="outlined"
            onClick={async () => {
              try {
                const ok = await requestPersistentStorage();
                notify(
                  ok
                    ? t("components.backup.persist-allowed")
                    : t("components.backup.persist-denied"),
                );
              } catch {
                notify(t("components.backup.persist-failed"));
              }
            }}
          >
            {t("components.backup.persist-action")}
          </Button>
        </section>
      )}
      <section className={styles["settings-card"]}>
        <div className={styles["section-icon"]}>
          <Icon data={ArrowDownToLine} size={22} />
        </div>
        <Text as="h2" variant="header-1">
          {t("components.backup.title")}
        </Text>
        <Text as="p" variant="body-1">
          {t("components.backup.description")}
        </Text>
        <Text
          as="label"
          variant="body-1"
          className={styles["backup-password"]}
          htmlFor="backup-password"
        >
          {t("components.backup.password")}
          <Text as="span" variant="inherit" className={styles.muted}>
            · {t("common.optional")}
          </Text>
          <TextInput
            id="backup-password"
            type="password"
            size="xl"
            value={password}
            onUpdate={setPassword}
            placeholder={t("components.backup.password-placeholder")}
            autoComplete="new-password"
            disabled={busy}
          />
        </Text>
        <Text as="p" variant="caption-2" className={shared["field-help"]}>
          {t("components.backup.password-help")}
        </Text>
        <div className={styles["backup-actions"]}>
          <Button
            size="xl"
            view="action"
            onClick={download}
            disabled={busy || recovery}
          >
            {t("components.backup.download")}
          </Button>
          <Button
            size="xl"
            view="outlined"
            onClick={() => file.current?.click()}
            disabled={busy}
          >
            {t("components.backup.restore")}
          </Button>
        </div>
        <input
          ref={file}
          type="file"
          accept=".json,application/json"
          hidden
          onChange={(e) => {
            const selected = e.target.files?.[0];
            if (selected) void read(selected);
            e.target.value = "";
          }}
        />
        {pending && (
          <div className={styles["import-confirm"]}>
            <Text as="h3" variant="subheader-2">
              {t("components.backup.file-cards", { count: pending.length })}
            </Text>
            <Text as="p" variant="body-1">
              {recovery
                ? t("components.backup.recovery-description")
                : t("components.backup.merge-description")}
            </Text>
            <Button view="action" onClick={merge} loading={busy}>
              {recovery
                ? t("components.backup.replace")
                : t("components.backup.merge")}
            </Button>
            <Button
              view="flat"
              onClick={() => setPending(null)}
              disabled={busy}
            >
              {t("common.cancel")}
            </Button>
          </div>
        )}
        {error && (
          <Text as="p" variant="body-1" role="alert" className={shared.error}>
            {error}
          </Text>
        )}
      </section>
      <Text as="div" variant="caption-2" className={styles["privacy-footnote"]}>
        {t("components.backup.privacy-footer")} <br />
        {t("components.backup.backup-footer")}
      </Text>
    </div>
  );
}
