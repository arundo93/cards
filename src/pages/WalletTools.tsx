import { Magnifier, Star } from "@gravity-ui/icons";
import { Icon, Text, TextInput } from "@gravity-ui/uikit";
import { useTranslation } from "react-i18next";
import { useWallet, type WalletFilter } from "../context/WalletContext";
import { categoryLabel } from "../lib/categories";
import styles from "./WalletTools.module.css";
export function WalletTools() {
  const { t, i18n } = useTranslation();
  const { cards, query, setQuery, filter, setFilter } = useWallet();
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
    <div className={styles["wallet-tools"]}>
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
            <Text
              as="button"
              variant="inherit"
              type="button"
              key={tab.id}
              className={`${styles["filter-tab"]} ${selected ? styles.selected : ""}`}
              aria-pressed={selected}
              onClick={() => setFilter(tab.filter)}
            >
              {tab.id === "favorites" && <Icon data={Star} size={14} />}
              {tab.label}
              {tab.id === "all" && (
                <Text variant="caption-1">
                  {new Intl.NumberFormat(i18n.resolvedLanguage).format(
                    cards.length,
                  )}
                </Text>
              )}
            </Text>
          );
        })}
      </fieldset>
      <div className={styles.search}>
        <TextInput
          value={query}
          onUpdate={setQuery}
          size="l"
          placeholder={t("pages.wallet.search")}
          aria-label={t("pages.wallet.search")}
          hasClear
          startContent={
            <span className={styles["search-icon"]}>
              <Magnifier width={15} height={15} />
            </span>
          }
        />
      </div>
    </div>
  );
}
