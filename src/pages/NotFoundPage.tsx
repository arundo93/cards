import { Button, Text } from "@gravity-ui/uikit";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import shared from "../styles/shared.module.css";
export function NotFoundPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <div className={shared["empty-state"]}>
      <Text as="h1" variant="display-3">
        {t("pages.missing.page-title")}
      </Text>
      <Text as="p" variant="body-1">
        {t("pages.missing.page-description")}
      </Text>
      <Button view="action" onClick={() => navigate("/", { replace: true })}>
        {t("pages.missing.back")}
      </Button>
    </div>
  );
}
