import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import type { DiscountCard } from "../lib/cards";
import {
  loadCards,
  restoreCardsAfterLoadError,
  saveCards,
} from "../lib/storage";

export type WalletFilter =
  | { kind: "all" }
  | { kind: "favorites" }
  | { kind: "category"; category: string };
interface WalletState {
  cards: DiscountCard[];
  loaded: boolean;
  loadError: string;
  busy: boolean;
  activeId: string | null;
  setActiveId: (id: string | null) => void;
  query: string;
  setQuery: (query: string) => void;
  filter: WalletFilter;
  setFilter: (filter: WalletFilter) => void;
  message: string;
  notify: (message: string) => void;
  resetFilters: () => void;
  persist: (cards: DiscountCard[]) => Promise<void>;
  restore: (cards: DiscountCard[]) => Promise<void>;
  save: (card: DiscountCard) => Promise<void>;
  favorite: (card: DiscountCard) => Promise<void>;
  remove: (id: string) => Promise<void>;
  copy: (value: string) => Promise<void>;
}
const WalletContext = createContext<WalletState | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const translate = useRef(t);
  useEffect(() => {
    translate.current = t;
  }, [t]);
  const [cards, setCards] = useState<DiscountCard[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [busy, setBusy] = useState(false);
  const writing = useRef(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<WalletFilter>({ kind: "all" });
  const [message, notify] = useState("");

  useEffect(() => {
    let current = true;
    loadCards()
      .then((result) => {
        if (current) {
          setCards(result);
          setLoaded(true);
        }
      })
      .catch((error: unknown) => {
        if (current)
          setLoadError(
            error instanceof Error
              ? error.message
              : translate.current("pages.state.load-failed"),
          );
      });
    return () => {
      current = false;
    };
  }, []);
  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(() => notify(""), 5500);
    return () => window.clearTimeout(timer);
  }, [message]);

  const resetFilters = useCallback(() => {
    setQuery("");
    setFilter({ kind: "all" });
  }, []);
  const persist = useCallback(
    async (next: DiscountCard[]) => {
      if (!loaded) throw new Error(t("pages.state.wait-for-storage"));
      if (writing.current) throw new Error(t("pages.state.saving"));
      writing.current = true;
      setBusy(true);
      try {
        await saveCards(next);
        setCards(next);
      } finally {
        writing.current = false;
        setBusy(false);
      }
    },
    [loaded, t],
  );
  async function restore(next: DiscountCard[]) {
    if (writing.current) throw new Error(t("pages.state.saving"));
    writing.current = true;
    setBusy(true);
    try {
      await restoreCardsAfterLoadError(next);
      setCards(next);
      setLoaded(true);
      setLoadError("");
    } finally {
      writing.current = false;
      setBusy(false);
    }
  }
  async function save(card: DiscountCard) {
    await persist(
      cards.some((item) => item.id === card.id)
        ? cards.map((item) => (item.id === card.id ? card : item))
        : [...cards, card],
    );
    resetFilters();
    setActiveId(card.id);
    notify(t("pages.state.saved"));
  }
  async function favorite(card: DiscountCard) {
    try {
      await persist(
        cards.map((item) =>
          item.id === card.id
            ? {
                ...item,
                favorite: !item.favorite,
                updatedAt: new Date().toISOString(),
              }
            : item,
        ),
      );
    } catch (error) {
      notify(
        error instanceof Error ? error.message : t("pages.state.save-failed"),
      );
    }
  }
  async function remove(id: string) {
    await persist(cards.filter((card) => card.id !== id));
    notify(t("pages.state.deleted"));
  }
  async function copy(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      notify(t("pages.state.copied"));
    } catch {
      notify(t("pages.state.copy-failed"));
    }
  }
  return (
    <WalletContext.Provider
      value={{
        cards,
        loaded,
        loadError,
        busy,
        activeId,
        setActiveId,
        query,
        setQuery,
        filter,
        setFilter,
        message,
        notify,
        resetFilters,
        persist,
        restore,
        save,
        favorite,
        remove,
        copy,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) throw new Error("WalletProvider is missing");
  return context;
}
