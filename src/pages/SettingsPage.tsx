import { Button, Text } from "@gravity-ui/uikit";
import { useTranslation } from "react-i18next";
import { BackupPanel } from "../components/BackupPanel";
import { usePwa } from "../context/PwaContext";
import { useWallet } from "../context/WalletContext";
import { PageTitle } from "./PageTitle";
import styles from "./SettingsPage.module.css";
export function SettingsPage() {
  const { t } = useTranslation();
  const { cards, persist, notify } = useWallet();
  const { installApp } = usePwa();
  return (
    <>
      <PageTitle
        title={t("pages.settings.title")}
        subtitle={t("pages.settings.subtitle")}
      />
      <div className={styles["settings-install"]}>
        <Button size="l" view="outlined" onClick={() => void installApp()}>
          {t("pages.shell.install")} ↗
        </Button>
        <Text as="span" variant="caption-2">
          {t("pages.settings.shortcut")}
        </Text>
      </div>
      <BackupPanel cards={cards} onImport={persist} notify={notify} />
    </>
  );
}
