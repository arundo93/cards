import {
  ArrowUpRightFromSquare,
  CreditCard,
  Gear,
  Wallet,
} from "@gravity-ui/icons";
import { Icon, Text } from "@gravity-ui/uikit";
import { useTranslation } from "react-i18next";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { usePwa } from "../context/PwaContext";
import { useWallet } from "../context/WalletContext";
import shared from "../styles/shared.module.css";
import styles from "./Sidebar.module.css";
export function Sidebar() {
  const { t, i18n } = useTranslation();
  const { cards } = useWallet();
  const { online, installApp } = usePwa();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  return (
    <aside className={styles.sidebar}>
      <Text
        as="button"
        variant="inherit"
        type="button"
        className={styles.brand}
        onClick={() => navigate("/")}
      >
        <span className={styles["brand-symbol"]}>
          <img src={`${import.meta.env.BASE_URL}icon.svg`} alt="" />
        </span>
        {t("pages.shell.brand")}
      </Text>
      <Text as="div" variant="caption-1" className={styles["sidebar-label"]}>
        {t("pages.shell.personal")}
      </Text>
      <nav aria-label={t("pages.shell.navigation")}>
        <NavLink
          to="/"
          className={({ isActive }) =>
            `${styles["nav-item"]} ${isActive || pathname.startsWith("/cards/") ? styles.active : ""}`
          }
        >
          <span>
            <Wallet width={19} height={19} />
          </span>
          <Text variant="inherit">{t("pages.shell.wallet")}</Text>
          <Text as="span" variant="caption-1" className={styles["nav-count"]}>
            {new Intl.NumberFormat(i18n.resolvedLanguage).format(cards.length)}
          </Text>
        </NavLink>
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `${styles["nav-item"]} ${isActive ? styles.active : ""}`
          }
        >
          <span>
            <Gear width={19} height={19} />
          </span>
          <Text variant="inherit">{t("pages.shell.settings")}</Text>
        </NavLink>
      </nav>
      <div className={styles["sidebar-bottom"]}>
        <div className={styles["tiny-card-icon"]} aria-hidden="true">
          <Icon data={CreditCard} size={20} />
        </div>
        <Text as="h3" variant="subheader-2">
          {t("pages.shell.less-plastic")}
          <br />
          {t("pages.shell.more-space")}
        </Text>
        <Text as="p" variant="body-1">
          {t("pages.shell.tagline")}
        </Text>
        <Text
          as="button"
          variant="inherit"
          type="button"
          className={styles["install-link"]}
          onClick={() => void installApp()}
        >
          {t("pages.shell.install")}{" "}
          <Icon data={ArrowUpRightFromSquare} size={14} />
        </Text>
        <Text as="div" variant="caption-2" className={styles["local-status"]}>
          <span className={shared["status-dot"]} />
          {t(online ? "pages.shell.private" : "pages.shell.offline")}
        </Text>
      </div>
    </aside>
  );
}
