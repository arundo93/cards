import { Button, Text } from "@gravity-ui/uikit";
import { useTranslation } from "react-i18next";
import { Dialog } from "../components/Dialog";
export function CardMissing({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  return (
    <Dialog title={t("pages.missing.title")} onClose={onClose}>
      <Text as="p" variant="body-1">
        {t("pages.missing.description")}
      </Text>
      <Button onClick={onClose}>{t("pages.missing.back")}</Button>
    </Dialog>
  );
}
