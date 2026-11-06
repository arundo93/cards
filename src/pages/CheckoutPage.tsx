import { Button, Text } from "@gravity-ui/uikit";
import { useTranslation } from "react-i18next";
import { Barcode } from "../components/Barcode";
import { Dialog } from "../components/Dialog";
import { useWallet } from "../context/WalletContext";
import { useCardRoute } from "../hooks/useCardRoute";
import { CardMissing } from "./CardMissing";
import styles from "./CheckoutPage.module.css";
export function CheckoutPage() {
  const { t } = useTranslation();
  const { copy } = useWallet();
  const { card, close } = useCardRoute();
  if (!card) return <CardMissing onClose={close} />;
  return (
    <Dialog title={card.name} onClose={close} wide>
      <div className={styles.checkout}>
        <Text
          as="span"
          variant="caption-1"
          className={styles["category-label"]}
        >
          {t("pages.checkout.hint")}
        </Text>
        <Barcode
          value={card.number}
          format={card.format}
          large
          showValue={false}
        />
        <Text as="div" variant="header-1" className={styles["checkout-number"]}>
          {card.number}
        </Text>
        <Text as="p" variant="body-1">
          {t("pages.checkout.brightness")}
        </Text>
        <Button
          view="outlined"
          size="xl"
          onClick={() => void copy(card.number)}
        >
          {t("pages.wallet.copy")}
        </Button>
      </div>
    </Dialog>
  );
}
