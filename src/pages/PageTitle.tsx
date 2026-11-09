import { Text } from "@gravity-ui/uikit";
import type { ReactNode } from "react";
import styles from "./PageTitle.module.css";
export function PageTitle({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className={styles["page-title"]}>
      <div>
        <Text as="h1" variant="display-3">
          {title}
          <span className={styles["title-dot"]}>.</span>
        </Text>
        {subtitle && (
          <Text as="p" variant="body-1">
            {subtitle}
          </Text>
        )}
      </div>
      {action}
    </div>
  );
}
