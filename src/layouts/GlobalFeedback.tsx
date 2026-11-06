import { Button, Text } from "@gravity-ui/uikit";
import { useTranslation } from "react-i18next";
import { Dialog } from "../components/Dialog";
import { usePwa } from "../context/PwaContext";
import { useWallet } from "../context/WalletContext";
import shared from "../styles/shared.module.css";
import styles from "./GlobalFeedback.module.css";
export function GlobalFeedback() {
  const { t } = useTranslation();
  const {
    installHelp,
    setInstallHelp,
    needRefresh,
    setNeedRefresh,
    updateServiceWorker,
  } = usePwa();
  const { message, notify } = useWallet();
  return (
    <>
      {installHelp && (
        <Dialog
          title={t("pages.pwa.title")}
          onClose={() => setInstallHelp(false)}
        >
          <Text as="p" variant="body-1">
            {t("pages.pwa.ios")}
          </Text>
          <Text as="p" variant="body-1">
            {t("pages.pwa.other")}
          </Text>
          <Text as="p" variant="body-1" className={shared.muted}>
            {t("pages.pwa.unsupported")}
          </Text>
        </Dialog>
      )}
      {needRefresh && (
        <div className={styles["update-toast"]} role="status">
          <Text variant="body-1">{t("pages.pwa.update-ready")}</Text>
          <Button view="action" onClick={() => void updateServiceWorker(true)}>
            {t("pages.pwa.update")}
          </Button>
          <Button view="flat" onClick={() => setNeedRefresh(false)}>
            {t("pages.pwa.later")}
          </Button>
        </div>
      )}
      {message && (
        <div className={styles.toast} role="status">
          <Text variant="body-1">{message}</Text>
          <button
            type="button"
            onClick={() => notify("")}
            aria-label={t("pages.state.close-notice")}
          >
            ✕
          </button>
        </div>
      )}
    </>
  );
}
