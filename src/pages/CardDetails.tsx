import { Button, Text } from "@gravity-ui/uikit";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Barcode } from "../components/Barcode";
import { useWallet } from "../context/WalletContext";
import type { DiscountCard } from "../lib/cards";
import { categoryLabel } from "../lib/categories";
import styles from "./CardDetails.module.css";
export function CardDetails({ card }: { card: DiscountCard }) {
  const { t } = useTranslation();
  const { busy, favorite, copy } = useWallet();
  const navigate = useNavigate();
  const open = (suffix = "") =>
    navigate(`/cards/${encodeURIComponent(card.id)}${suffix}`, {
      state: { walletDialog: true },
    });
  return (
    <section
      className={styles["card-details"]}
      aria-label={t("pages.wallet.selected")}
    >
      <div className={styles["card-meta"]}>
        <div>
          <Text
            as="span"
            variant="caption-1"
            className={styles["category-label"]}
          >
            {categoryLabel(card.category, t)}
          </Text>
          <Text as="h2" variant="header-1">
            {card.name}
          </Text>
        </div>
        <button
          type="button"
          className={`${styles["favorite-button"]} ${card.favorite ? styles["is-favorite"] : ""}`}
          aria-label={t(
            card.favorite
              ? "pages.wallet.remove-favorite"
              : "pages.wallet.add-favorite",
          )}
          aria-pressed={card.favorite}
          disabled={busy}
          onClick={() => void favorite(card)}
        >
          {card.favorite ? "★" : "☆"}
        </button>
      </div>
      <div className={styles["barcode-preview"]}>
        <Barcode
          value={card.number}
          format={card.format}
          compact
          showValue={false}
        />
      </div>
      <Text
        as="button"
        variant="inherit"
        type="button"
        className={styles["copy-number"]}
        onClick={() => void copy(card.number)}
        aria-label={t("pages.wallet.copy-label")}
      >
        {card.number}
        <span>⧉</span>
      </Text>
      <Button view="action" size="xl" width="max" onClick={() => open()}>
        {t("pages.wallet.checkout")}{" "}
        <span className={styles["button-arrow"]}>↗</span>
      </Button>
      <div className={styles["detail-actions"]}>
        <Button view="flat" size="m" onClick={() => void copy(card.number)}>
          {t("pages.wallet.copy")}
        </Button>
        <span>·</span>
        <Button view="flat" size="m" onClick={() => open("/edit")}>
          {t("pages.wallet.edit")}
        </Button>
        <span>·</span>
        <Button view="flat-danger" size="m" onClick={() => open("/delete")}>
          {t("pages.wallet.delete")}
        </Button>
      </div>
      {card.notes && (
        <Text as="p" variant="caption-2" className={styles["card-note"]}>
          {card.notes}
        </Text>
      )}
    </section>
  );
}
