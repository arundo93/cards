import { Magnifier, Plus } from "@gravity-ui/icons";
import { Button, Icon, Text } from "@gravity-ui/uikit";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useWallet } from "../context/WalletContext";
import shared from "../styles/shared.module.css";
import styles from "./WalletEmpty.module.css";
export function WalletEmpty({ filtered = false }: { filtered?: boolean }) {
  const { t } = useTranslation();
  const { resetFilters } = useWallet();
  const navigate = useNavigate();
  if (filtered)
    return (
      <div className={shared["empty-state"]}>
        <span className={styles["empty-symbol"]} aria-hidden="true">
          <Icon data={Magnifier} size={32} />
        </span>
        <Text as="h2" variant="display-1">
          {t("pages.empty.not-found")}
        </Text>
        <Text as="p" variant="body-1">
          {t("pages.empty.try-another")}
        </Text>
        <Button view="outlined" onClick={resetFilters}>
          {t("pages.empty.reset")}
        </Button>
      </div>
    );
  return (
    <div className={`${shared["empty-state"]} ${styles.welcome}`}>
      <div className={styles["empty-card-art"]} aria-hidden="true">
        <div className={styles["art-back"]} />
        <div className={styles["art-front"]}>
          <Text as="span" variant="caption-2">
            {t("pages.empty.favorite")}
          </Text>
          <Text as="strong" variant="display-2">
            {t("pages.empty.card")}
          </Text>
          <Text as="small" variant="caption-1">
            {t("pages.empty.always")}
          </Text>
        </div>
      </div>
      <Text as="span" variant="caption-1" className={styles.eyebrow}>
        {t("pages.empty.eyebrow")}
      </Text>
      <Text as="h2" variant="display-1">
        {t("pages.empty.title")}
      </Text>
      <Text as="p" variant="body-1">
        {t("pages.empty.subtitle")}
      </Text>
      <Button
        view="action"
        size="xl"
        onClick={() =>
          navigate("/cards/new", { state: { walletDialog: true } })
        }
      >
        <Icon data={Plus} size={18} /> {t("pages.empty.add-first")}
      </Button>
    </div>
  );
}
