import { Dialog as GravityDialog, Sheet, useMobile } from "@gravity-ui/uikit";
import type { ReactNode } from "react";
import styles from "./Dialog.module.css";
export function Dialog({
  title,
  onClose,
  children,
  wide = false,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}) {
  const mobile = useMobile();
  if (mobile) {
    return (
      <Sheet
        open
        title={title}
        id="discount-cards-dialog"
        className={styles.sheet}
        contentClassName={styles["sheet-content"]}
        maxContentHeightCoefficient={0.96}
        allowHideOnContentScroll
        onOpenChange={(open) => {
          if (!open) onClose();
        }}
      >
        {children}
      </Sheet>
    );
  }
  return (
    <GravityDialog
      open
      maxWidth={wide ? "m" : "s"}
      fullWidth
      contentOverflow="auto"
      className={styles.dialog}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <GravityDialog.Header caption={title} />
      <GravityDialog.Body className={styles["dialog-body"]}>
        {children}
      </GravityDialog.Body>
    </GravityDialog>
  );
}
