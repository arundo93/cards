import { Button, Text } from "@gravity-ui/uikit";
import { useTranslation } from "react-i18next";
import { Outlet, useLocation } from "react-router-dom";
import { BackupPanel } from "../components/BackupPanel";
import { usePwa } from "../context/PwaContext";
import { useWallet } from "../context/WalletContext";
import shared from "../styles/shared.module.css";
import styles from "./AppShell.module.css";
import { GlobalFeedback } from "./GlobalFeedback";
import { Sidebar } from "./Sidebar";
export function AppShell() {
  const { t } = useTranslation();
  const { loaded, loadError, notify, restore } = useWallet();
  const { online, offlineReady } = usePwa();
  const { pathname } = useLocation();
  return (
    <div className={styles["app-shell"]}>
      <Sidebar />
      <main className={styles["main-content"]}>
        <header className={styles.topbar}>
          <Text as="span" variant="inherit" className={styles.breadcrumb}>
            {t("pages.shell.wallet")} <span>/</span>{" "}
            {t(
              pathname === "/settings"
                ? "pages.shell.storage"
                : "pages.shell.cards",
            )}
          </Text>
          <Text as="span" variant="inherit" className={styles["topbar-status"]}>
            <span className={shared["status-dot"]} />
            {t(
              offlineReady
                ? "pages.shell.offline-ready"
                : online
                  ? "pages.shell.local-storage"
                  : "pages.shell.no-internet",
            )}
          </Text>
        </header>
        {loadError ? (
          <div>
            <div className={shared["empty-state"]}>
              <Text as="h1" variant="display-3">
                {t("pages.state.load-failed")}
              </Text>
              <Text
                as="p"
                variant="body-1"
                className={shared.error}
                role="alert"
              >
                {loadError}
              </Text>
              <Button onClick={() => location.reload()}>
                {t("pages.state.retry")}
              </Button>
            </div>
            <BackupPanel
              cards={[]}
              recovery
              notify={notify}
              onImport={restore}
            />
          </div>
        ) : !loaded ? (
          <div className={shared["empty-state"]} role="status">
            <Text variant="body-1">{t("pages.state.loading")}</Text>
          </div>
        ) : (
          <Outlet />
        )}
      </main>
      <GlobalFeedback />
    </div>
  );
}
