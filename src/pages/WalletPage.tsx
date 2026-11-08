import { Plus } from "@gravity-ui/icons";
import { Button, Icon, Text } from "@gravity-ui/uikit";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Outlet, useNavigate } from "react-router-dom";
import { CardCarousel } from "../components/CardCarousel";
import { useWallet } from "../context/WalletContext";
import shared from "../styles/shared.module.css";
import { CardDetails } from "./CardDetails";
import { PageTitle } from "./PageTitle";
import { WalletEmpty } from "./WalletEmpty";
import styles from "./WalletPage.module.css";
import { WalletTools } from "./WalletTools";
export function WalletPage() {
  const { t, i18n } = useTranslation();
  const { cards, activeId, setActiveId, query, filter } = useWallet();
  const navigate = useNavigate();
  const position = new Intl.NumberFormat(i18n.resolvedLanguage, {
    minimumIntegerDigits: 2,
    useGrouping: false,
  });
  const filtered = useMemo(
    () =>
      cards.filter(
        (card) =>
          (filter.kind !== "favorites" || card.favorite) &&
          (filter.kind !== "category" || card.category === filter.category) &&
          `${card.name} ${card.number}`
            .toLocaleLowerCase(i18n.language)
            .includes(query.toLocaleLowerCase(i18n.language)),
      ),
    [cards, filter, query, i18n.language],
  );
  const current = filtered.find((card) => card.id === activeId) ?? filtered[0];
  return (
    <>
      <PageTitle
        title={t("pages.wallet.title")}
        subtitle={t("pages.wallet.subtitle")}
        action={
          <Button
            view="action"
            size="xl"
            onClick={() =>
              navigate("/cards/new", { state: { walletDialog: true } })
            }
          >
            <Icon data={Plus} size={18} /> {t("pages.wallet.add")}
          </Button>
        }
      />
      {cards.length ? (
        <>
          <WalletTools />
          {current ? (
            <>
              <div className={styles["collection-caption"]}>
                <Text as="span" variant="inherit">
                  {t("pages.wallet.collection")}
                </Text>
                <Text as="span" variant="inherit">
                  {position.format(filtered.indexOf(current) + 1)}{" "}
                  <Text as="span" variant="inherit" className={shared.muted}>
                    / {position.format(filtered.length)}
                  </Text>
                </Text>
              </div>
              <CardCarousel
                cards={filtered}
                activeId={current.id}
                onSelect={setActiveId}
                onOpen={(card) => setActiveId(card.id)}
              />
              <CardDetails card={current} />
            </>
          ) : (
            <WalletEmpty filtered />
          )}
        </>
      ) : (
        <WalletEmpty />
      )}
      <Outlet />
    </>
  );
}
