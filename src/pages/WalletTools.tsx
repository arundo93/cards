import { Magnifier, Star, Xmark } from "@gravity-ui/icons";
import { Button, Icon, Text, TextInput, useMobile } from "@gravity-ui/uikit";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useWallet, type WalletFilter } from "../context/WalletContext";
import { categoryLabel } from "../lib/categories";
import styles from "./WalletTools.module.css";
export function WalletTools() {
  const { t, i18n } = useTranslation();
  const { cards, query, setQuery, filter, setFilter } = useWallet();
  const mobile = useMobile();
  const [searchOpen, setSearchOpen] = useState(() => Boolean(query));
  const tabs: { id: string; label: string; filter: WalletFilter }[] = [
    { id: "all", label: t("pages.wallet.all"), filter: { kind: "all" } },
    {
      id: "favorites",
      label: t("pages.wallet.favorites"),
      filter: { kind: "favorites" },
    },
    ...Array.from(
      new Set(cards.map((card) => card.category).filter(Boolean)),
    ).map((category) => ({
      id: `category:${category}`,
      label: categoryLabel(category, t),
      filter: { kind: "category" as const, category },
    })),
  ];
  return (
    <div
      className={`${styles["wallet-tools"]} ${mobile && searchOpen ? styles["search-open"] : ""}`}
    >
      <fieldset
        className={styles["filter-tabs"]}
        aria-label={t("pages.wallet.filters")}
      >
        {tabs.map((tab) => {
          const selected =
            filter.kind === tab.filter.kind &&
            (filter.kind !== "category" ||
              (tab.filter.kind === "category" &&
                filter.category === tab.filter.category));
          return (
            <Button
              view="flat"
              size="m"
              key={tab.id}
              className={styles["filter-tab"]}
              selected={selected}
              onClick={() => setFilter(tab.filter)}
            >
              {tab.id === "favorites" && <Icon data={Star} size={14} />}
              {tab.label}
              {tab.id === "all" && (
                <Text variant="caption-1" className={styles["filter-count"]}>
                  {new Intl.NumberFormat(i18n.resolvedLanguage).format(
                    cards.length,
                  )}
                </Text>
              )}
            </Button>
          );
        })}
      </fieldset>
      <div
        className={`${styles.search} ${mobile && searchOpen ? styles.expanded : ""}`}
      >
        {mobile && !searchOpen ? (
          <Button
            view="outlined"
            size="l"
            aria-label={t("pages.wallet.search")}
            onClick={() => setSearchOpen(true)}
          >
            <Icon data={Magnifier} size={16} />
          </Button>
        ) : (
          <TextInput
            value={query}
            onUpdate={setQuery}
            size="l"
            placeholder={t("pages.wallet.search")}
            aria-label={t("pages.wallet.search")}
            autoFocus={mobile}
            startContent={
              <Icon
                data={Magnifier}
                size={15}
                className={styles["search-icon"]}
              />
            }
            endContent={
              mobile ? (
                <Button
                  view="flat-secondary"
                  size="s"
                  aria-label={t("pages.wallet.close-search")}
                  onClick={() => {
                    setQuery("");
                    setSearchOpen(false);
                  }}
                >
                  <Icon data={Xmark} size={14} />
                </Button>
              ) : undefined
            }
            hasClear={!mobile}
          />
        )}
      </div>
    </div>
  );
}
