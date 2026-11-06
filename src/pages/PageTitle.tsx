import { Text } from "@gravity-ui/uikit";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import styles from "./PageTitle.module.css";
export function PageTitle({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle: string;
  action?: ReactNode;
}) {
  const { t } = useTranslation();
  return (
    <div className={styles["page-title"]}>
      <div>
        <Text as="div" variant="caption-1" className={styles.eyebrow}>
          {t("pages.wallet.eyebrow")}
        </Text>
        <Text as="h1" variant="display-3">
          {title}
          <span className={styles["title-dot"]}>.</span>
        </Text>
        <Text as="p" variant="body-1">
          {subtitle}
        </Text>
      </div>
      {action}
    </div>
  );
}
