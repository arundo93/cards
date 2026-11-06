import { Text } from "@gravity-ui/uikit";
import bwipjs from "bwip-js/browser";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { createBarcodeOptions } from "../lib/barcode";
import type { DiscountCard } from "../lib/cards";
import styles from "./Barcode.module.css";

interface BarcodeProps {
  value: string;
  format: DiscountCard["format"];
  className?: string;
  large?: boolean;
  compact?: boolean;
  showValue?: boolean;
}

export function Barcode({
  value,
  format,
  className = "",
  large = false,
  compact = false,
  showValue = true,
}: BarcodeProps) {
  const { t } = useTranslation();
  const canvas = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!canvas.current) return;
    try {
      bwipjs.toCanvas(
        canvas.current,
        createBarcodeOptions(value, format, large),
      );
      setError(null);
    } catch {
      setError(t("components.barcode.error"));
    }
  }, [value, format, large, t]);

  return (
    <div
      className={`${styles["dc-barcode"]} ${format === "QR" ? styles["dc-barcode--qr"] : ""} ${large ? styles["dc-barcode--large"] : ""} ${compact ? styles.compact : ""} ${className}`}
    >
      <canvas
        ref={canvas}
        role="img"
        aria-label={t(
          format === "QR"
            ? "components.barcode.qr-label"
            : "components.barcode.barcode-label",
          { value },
        )}
        hidden={Boolean(error)}
      />
      {error && (
        <Text
          as="p"
          variant="body-1"
          className={styles["dc-barcode__error"]}
          role="alert"
        >
          {error}
        </Text>
      )}
      {showValue && (
        <Text
          as="span"
          variant="body-1"
          className={styles["dc-barcode__value"]}
        >
          {value}
        </Text>
      )}
    </div>
  );
}
