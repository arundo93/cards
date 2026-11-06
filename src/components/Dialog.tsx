import { Text } from "@gravity-ui/uikit";
import { type ReactNode, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);
  return (
    <dialog
      ref={ref}
      className={`${styles.dialog} ${wide ? styles["dialog-wide"] : ""}`}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.preventDefault();
          onClose();
        }
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          const r = e.currentTarget.getBoundingClientRect();
          if (
            e.clientX < r.left ||
            e.clientX > r.right ||
            e.clientY < r.top ||
            e.clientY > r.bottom
          )
            onClose();
        }
      }}
      aria-label={title}
    >
      <div className={styles["dialog-heading"]}>
        <Text as="h2" variant="header-2">
          {title}
        </Text>
        <button
          type="button"
          className={styles["icon-button"]}
          onClick={onClose}
          aria-label={t("common.close")}
        >
          ✕
        </button>
      </div>
      {children}
    </dialog>
  );
}
