import {
  ChevronLeft,
  ChevronRight,
  QrCode,
  Star,
  StarFill,
} from "@gravity-ui/icons";
import { Icon, Text } from "@gravity-ui/uikit";
import {
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import type { DiscountCard } from "../lib/cards";
import { virtualSlots, wrapIndex } from "../lib/carousel";
import { categoryLabel } from "../lib/categories";
import styles from "./CardCarousel.module.css";

interface CardCarouselProps {
  cards: DiscountCard[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onOpen: (card: DiscountCard) => void;
  onFavorite: (card: DiscountCard) => void;
  favoriteDisabled?: boolean;
}

function cardInk(color: string) {
  const hex = color.replace("#", "");
  if (!/^[0-9a-f]{6}$/i.test(hex)) return "#ffffff";
  const [red, green, blue] = [0, 2, 4].map((offset) => {
    const channel = Number.parseInt(hex.slice(offset, offset + 2), 16) / 255;
    return channel <= 0.04045
      ? channel / 12.92
      : ((channel + 0.055) / 1.055) ** 2.4;
  });
  const luminance = red * 0.2126 + green * 0.7152 + blue * 0.0722;
  return (luminance + 0.05) / 0.07 > 1.05 / (luminance + 0.05)
    ? "#252822"
    : "#ffffff";
}

function CarouselTrack({
  cards,
  activeId,
  onSelect,
  onOpen,
  onFavorite,
  favoriteDisabled,
}: CardCarouselProps) {
  const { t, i18n } = useTranslation();
  const positionNumber = new Intl.NumberFormat(i18n.resolvedLanguage, {
    minimumIntegerDigits: 2,
    useGrouping: false,
  });
  const initialIndex = Math.max(
    0,
    cards.findIndex((card) => card.id === activeId),
  );
  const [motion, setMotion] = useState({ cursor: initialIndex, direction: 0 });
  const currentMotion = useRef(motion);
  const pending = useRef<number[]>([]);
  const expectedId = useRef<string | null>(null);
  const pointer = useRef<{ x: number; y: number; id: number } | null>(null);
  const swiped = useRef(false);
  const stage = useRef<HTMLDivElement>(null);
  const restoreCardFocus = useRef(false);
  const index = wrapIndex(motion.cursor + motion.direction, cards.length);
  const active = cards[index];

  const move = useCallback(
    (step: number) => {
      if (cards.length < 2) return;
      if (currentMotion.current.direction) {
        // Bound the queue so a burst cannot keep the wallet moving for seconds.
        if (pending.current.length < 4) pending.current.push(step);
        return;
      }
      const next = { cursor: currentMotion.current.cursor, direction: step };
      expectedId.current =
        cards[wrapIndex(next.cursor + step, cards.length)].id;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        next.cursor += step;
        next.direction = 0;
      }
      currentMotion.current = next;
      setMotion(next);
      onSelect(expectedId.current);
    },
    [cards, onSelect],
  );

  useEffect(() => {
    if (!activeId || activeId === expectedId.current) return;
    const selected = cards.findIndex((card) => card.id === activeId);
    if (
      selected < 0 ||
      cards[
        wrapIndex(
          currentMotion.current.cursor + currentMotion.current.direction,
          cards.length,
        )
      ]?.id === activeId
    )
      return;
    // A filter/search/list selection is a new track, not an animated wrap.
    pending.current = [];
    const next = { cursor: selected, direction: 0 };
    currentMotion.current = next;
    setMotion(next);
  }, [activeId, cards]);

  useEffect(() => {
    if (!motion.direction) {
      if (restoreCardFocus.current) {
        stage.current
          ?.querySelector<HTMLButtonElement>(
            `button.${styles["dc-card--active"]}`,
          )
          ?.focus({ preventScroll: true });
        restoreCardFocus.current = false;
      }
      if (!pending.current.length) return;
      // Paint the recycled offscreen slot before starting the next transition.
      const frame = requestAnimationFrame(() => {
        const step = pending.current.shift();
        if (step) move(step);
      });
      return () => cancelAnimationFrame(frame);
    }
  }, [motion, move]);

  useEffect(() => {
    if (!motion.direction) return;
    const timer = window.setTimeout(() => {
      const next = { cursor: motion.cursor + motion.direction, direction: 0 };
      currentMotion.current = next;
      setMotion(next);
    }, 450);
    return () => window.clearTimeout(timer);
  }, [motion]);

  function handleKey(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      restoreCardFocus.current = event.currentTarget.classList.contains(
        styles["dc-card"],
      );
      swiped.current = false;
      move(event.key === "ArrowLeft" ? -1 : 1);
    }
  }

  function startSwipe(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    pointer.current = {
      x: event.clientX,
      y: event.clientY,
      id: event.pointerId,
    };
    swiped.current = false;
  }

  function finishSwipe(event: PointerEvent<HTMLDivElement>) {
    const start = pointer.current;
    pointer.current = null;
    if (!start || start.id !== event.pointerId) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.abs(dx) > 42 && Math.abs(dx) > Math.abs(dy) * 1.25) {
      swiped.current = true;
      move(dx < 0 ? 1 : -1);
    }
  }

  if (!active) return null;
  const visible = virtualSlots(
    motion.cursor,
    motion.direction,
    cards.length,
  ).map((slot) => ({
    ...slot,
    card: cards[slot.index],
    position: slot.to === 0 ? "active" : slot.to < 0 ? "previous" : "next",
  }));

  return (
    <section
      className={styles["dc-carousel"]}
      aria-label={t("components.carousel.label")}
      aria-roledescription={t("components.carousel.role")}
    >
      <div className={styles["dc-carousel__navigation"]}>
        <button
          type="button"
          className={styles["dc-carousel__arrow"]}
          disabled={cards.length < 2}
          onClick={() => move(-1)}
          onKeyDown={handleKey}
          aria-label={t("components.carousel.previous")}
        >
          <Icon data={ChevronLeft} size={18} />
        </button>
        <Text
          as="span"
          variant="inherit"
          className={styles["dc-carousel__position"]}
          aria-live="polite"
          aria-atomic="true"
        >
          <strong>{positionNumber.format(index + 1)}</strong>
          <span>/</span>
          {positionNumber.format(cards.length)}
          <span className={styles["dc-sr-only"]}> — {active.name}</span>
        </Text>
        <button
          type="button"
          className={styles["dc-carousel__arrow"]}
          disabled={cards.length < 2}
          onClick={() => move(1)}
          onKeyDown={handleKey}
          aria-label={t("components.carousel.next")}
        >
          <Icon data={ChevronRight} size={18} />
        </button>
      </div>
      <div
        ref={stage}
        className={`${styles["dc-carousel__stage"]} ${motion.direction ? styles["dc-carousel__stage--moving"] : ""} ${cards.length < 3 ? styles["dc-carousel__stage--single"] : ""}`}
        onPointerDownCapture={startSwipe}
        onPointerUpCapture={finishSwipe}
        onPointerCancelCapture={() => {
          pointer.current = null;
        }}
      >
        {visible.map(
          ({ card, position, key, from, to, visible: isVisible }) => (
            <button
              key={key}
              type="button"
              tabIndex={isVisible ? 0 : -1}
              aria-hidden={!isVisible}
              data-slot={to}
              className={`${styles["dc-card"]} ${styles[`dc-card--${position}`] ?? ""}`}
              style={
                {
                  "--card-color": card.color,
                  "--card-ink": cardInk(card.color),
                  "--slot": to,
                  "--side": Math.sign(to),
                  zIndex: to === 0 ? 4 : from === 0 ? 3 : 1,
                  visibility: isVisible ? "visible" : "hidden",
                  pointerEvents: isVisible ? "auto" : "none",
                } as CSSProperties
              }
              aria-label={`${t(position === "active" ? "components.carousel.open" : "components.carousel.select", { name: card.name })}${card.favorite ? t("components.carousel.favorite-suffix") : ""}`}
              aria-current={position === "active" ? "true" : undefined}
              onKeyDown={handleKey}
              onClick={() => {
                if (swiped.current) {
                  swiped.current = false;
                  return;
                }
                if (motion.direction) return;
                if (position === "active") onOpen(card);
                else move(to < 0 ? -1 : 1);
              }}
            >
              <span className={styles["dc-card__art"]} aria-hidden="true">
                <span />
                <span />
                <span />
              </span>
              <span className={styles["dc-card__top"]}>
                <span
                  className={styles["dc-card__monogram"]}
                  aria-hidden="true"
                >
                  {Array.from(card.name.trim())[0]?.toUpperCase() ||
                    t("components.carousel.monogram")}
                </span>
                <Text
                  as="span"
                  variant="caption-2"
                  className={styles["dc-card__category"]}
                >
                  {categoryLabel(card.category, t) ||
                    t("components.carousel.loyalty-card")}
                </Text>
              </span>
              <Text
                as="span"
                variant="display-2"
                className={styles["dc-card__name"]}
              >
                {card.name}
              </Text>
              <span className={styles["dc-card__bottom"]}>
                <Text
                  as="span"
                  variant="body-1"
                  className={styles["dc-card__number"]}
                >
                  {card.format === "QR" && card.number.length > 24
                    ? t("components.carousel.qr-card")
                    : card.number}
                </Text>
                <Icon
                  className={styles["dc-card__scan"]}
                  data={QrCode}
                  size={24}
                />
              </span>
            </button>
          ),
        )}
        <button
          type="button"
          className={`${styles["dc-carousel__favorite"]} ${active.favorite ? styles["is-favorite"] : ""}`}
          aria-label={t(
            active.favorite
              ? "pages.wallet.remove-favorite"
              : "pages.wallet.add-favorite",
          )}
          aria-pressed={active.favorite}
          disabled={favoriteDisabled || Boolean(motion.direction)}
          style={{ "--favorite-ink": cardInk(active.color) } as CSSProperties}
          onClick={() => onFavorite(active)}
        >
          <Icon data={active.favorite ? StarFill : Star} size={18} />
        </button>
      </div>
    </section>
  );
}

export function CardCarousel(props: CardCarouselProps) {
  return (
    <CarouselTrack
      key={props.cards.map((card) => card.id).join("|")}
      {...props}
    />
  );
}
