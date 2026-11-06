import { Button, Text } from "@gravity-ui/uikit";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Dialog } from "../components/Dialog";
import { useWallet } from "../context/WalletContext";
import { useCardRoute } from "../hooks/useCardRoute";
import shared from "../styles/shared.module.css";
import { CardMissing } from "./CardMissing";
export function DeleteCardPage() {
  const { t } = useTranslation();
  const { busy, remove } = useWallet();
  const { card, close } = useCardRoute();
  const [error, setError] = useState("");
  if (!card) return <CardMissing onClose={close} />;
  const id = card.id;
  async function confirm() {
    setError("");
    try {
      await remove(id);
      close();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : t("pages.state.save-failed"),
      );
    }
  }
  return (
    <Dialog
      title={t("pages.delete.title")}
      onClose={() => {
        if (!busy) close();
      }}
    >
      <Text as="p" variant="body-1">
        {t("pages.delete.description", { name: card.name })}
      </Text>
      {error && (
        <Text as="p" variant="body-1" className={shared.error} role="alert">
          {error}
        </Text>
      )}
      <div className={shared["dialog-actions"]}>
        <Button size="l" onClick={close} disabled={busy}>
          {t("pages.delete.keep")}
        </Button>
        <Button
          size="l"
          view="outlined-danger"
          onClick={() => void confirm()}
          loading={busy}
        >
          {t("pages.delete.confirm")}
        </Button>
      </div>
    </Dialog>
  );
}
