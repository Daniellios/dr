import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { birthdayMessageRu } from "./data/message";
import { getAlbumPhotoUrls } from "./data/albumPhotos";
import bookCoverImage from "../assets/book-cover.jpg";
import giftBoxImage from "../assets/gift-box.png";
import StampFlyCard from "./components/StampFlyCard";
import BolshoiTicketReveal from "./components/BolshoiTicketReveal";

const TEXT_SCALES = [
  { w: 1, h: 1 },
  { w: 1.14, h: 1.07 },
  { w: 1.06, h: 1.19 },
  { w: 1.18, h: 1.04 },
  { w: 1.02, h: 1.15 }
];

const PHOTO_SCALES = [
  { w: 1.06, h: 1.5 },
  { w: 1.02, h: 1.44 },
  { w: 1.1, h: 1.42 },
  { w: 1.04, h: 1.56 }
];

const SCROLL_END_PX = 24;
const GIFT_STEPS = 4;
const GIFT_OPEN_MS = 820;
const GIFT_CLICKS_TO_OPEN = 50;
const TICKET_FLYOUT_MS = 1200;
const GIFT_PULSE_UNTIL_CLICKS = 20;
const FLOAT_EMOJIS = [
  { symbol: "❤️", x: "8%", y: "14%", delay: "0s", dur: "9.5s", size: "1.35rem" },
  { symbol: "🎂", x: "86%", y: "18%", delay: "1.2s", dur: "10.2s", size: "1.45rem" },
  { symbol: "🥳", x: "16%", y: "78%", delay: "2.1s", dur: "8.8s", size: "1.4rem" },
  { symbol: "🎁", x: "82%", y: "76%", delay: "0.8s", dur: "10.8s", size: "1.5rem" },
  { symbol: "💐", x: "48%", y: "10%", delay: "1.8s", dur: "11.2s", size: "1.45rem" },
  { symbol: "✨", x: "50%", y: "86%", delay: "0.3s", dur: "8.2s", size: "1.2rem" },
  { symbol: "✨", x: "28%", y: "28%", delay: "2.6s", dur: "9.1s", size: "1.1rem" },
  { symbol: "❤️", x: "72%", y: "42%", delay: "1.5s", dur: "10.5s", size: "1.25rem" }
];
const HEART_ROAD_COUNT = 3;

export default function App() {
  const [scrollTop, setScrollTop] = useState(0);
  const [scrollAtEnd, setScrollAtEnd] = useState(false);
  const [ticketDismissed, setTicketDismissed] = useState(false);
  const [ticketReady, setTicketReady] = useState(false);
  const [ticketFlyout, setTicketFlyout] = useState(false);
  const [giftClicks, setGiftClicks] = useState(0);
  const [giftStep, setGiftStep] = useState(0);
  const [giftUnwrapped, setGiftUnwrapped] = useState(false);
  const [giftOpening, setGiftOpening] = useState(false);

  const albumScrollRef = useRef(null);
  const giftStageRef = useRef(null);
  const giftClicksRef = useRef(giftClicks);
  const giftUnwrappedRef = useRef(giftUnwrapped);
  const giftOpeningRef = useRef(giftOpening);
  const ticketReadyRef = useRef(ticketReady);
  const ticketFlyoutRef = useRef(ticketFlyout);

  useEffect(() => {
    giftClicksRef.current = giftClicks;
    giftUnwrappedRef.current = giftUnwrapped;
    giftOpeningRef.current = giftOpening;
    ticketReadyRef.current = ticketReady;
    ticketFlyoutRef.current = ticketFlyout;
  }, [giftClicks, giftOpening, giftUnwrapped, ticketFlyout, ticketReady]);

  const updateAlbumScrollState = useCallback((el) => {
    setScrollTop(el.scrollTop);
    const gap = el.scrollHeight - el.scrollTop - el.clientHeight;
    const nearEnd = gap <= SCROLL_END_PX;
    setScrollAtEnd(nearEnd);
    // Reset only when user returns to the very start AND hasn't started opening the gift.
    // Otherwise tiny scroll snaps can accidentally wipe the "reward" state.
    if (el.scrollTop <= 8) {
      const hasStartedGift =
        giftClicksRef.current > 0 ||
        giftOpeningRef.current ||
        giftUnwrappedRef.current ||
        ticketFlyoutRef.current ||
        ticketReadyRef.current;

      if (!hasStartedGift) {
        setTicketDismissed(false);
        setTicketReady(false);
        setTicketFlyout(false);
        setGiftClicks(0);
        setGiftStep(0);
        setGiftUnwrapped(false);
        setGiftOpening(false);
      }
    }
  }, []);

  const onAlbumScroll = useCallback(
    (e) => updateAlbumScrollState(e.currentTarget),
    [updateAlbumScrollState]
  );

  const resetToAlbumStart = useCallback(() => {
    const el = albumScrollRef.current;
    if (el) {
      el.scrollTop = 0;
      updateAlbumScrollState(el);
    } else {
      setScrollTop(0);
      setScrollAtEnd(false);
    }
    setTicketDismissed(false);
    setTicketReady(false);
    setTicketFlyout(false);
    setGiftClicks(0);
    setGiftStep(0);
    setGiftUnwrapped(false);
    setGiftOpening(false);
  }, [updateAlbumScrollState]);

  const cards = useMemo(() => {
    const photos = getAlbumPhotoUrls();
    const { recipientName, headline, lines, signature } = birthdayMessageRu;
    let photoSlot = 0;

    const blocks = [
      {
        key: "headline",
        kind: "text",
        text: headline,
        className: "slower headline-slot",
        variant: "cream",
        tiltDeg: -2.2,
        scale: TEXT_SCALES[0]
      },
      ...lines.map((text, i) => ({
        key: `line-${i}`,
        kind: "text",
        text,
        className: ["faster", "slower vertical", "slower slower-down"][i],
        variant: ["sage", "blush", "linen", "lavender", "sky"][i % 5],
        tiltDeg: [1.6, -1.4, 2.4][i],
        scale: TEXT_SCALES[i + 1]
      })),
      {
        key: "sign",
        kind: "text",
        text: `${signature}`,
        className: "faster1",
        variant: "parchment",
        tiltDeg: -1.8,
        scale: TEXT_SCALES[4]
      }
    ];

    const out = [];
    for (let i = 0; i < blocks.length; i += 1) {
      const b = blocks[i];
      out.push(b);

      // Keep headline standalone; alternate only after it:
      // headline, then wish card -> photo card -> wish card -> photo card...
      if (i === 0) continue;

      const image = photos[photoSlot];
      if (!image) continue;

      const slot = photoSlot;
      photoSlot += 1;
      out.push({
        key: `photo-${slot}`,
        kind: "photo",
        image,
        imageAlt: recipientName ? `Фото — ${recipientName}` : "Фото",
        className: ["faster", "slower vertical", "faster1", "faster"][slot % 4],
        variant: ["sage", "blush", "linen", "parchment", "lavender", "sky"][slot % 6],
        tiltDeg: [1.35, -1.15, 1.75, -1.55][slot % 4],
        scale: PHOTO_SCALES[slot % PHOTO_SCALES.length]
      });
    }

    for (let i = 0; i < HEART_ROAD_COUNT; i += 1) {
      out.push({
        key: `heart-road-${i}`,
        kind: "hearts",
        className: i % 2 === 0 ? "faster1 heart-road-slot" : "faster heart-road-slot",
        variant: ["blush", "lavender", "parchment", "sky"][i % 4],
        tiltDeg: [-0.8, 0.9, -0.6, 0.7][i % 4],
        scale: { w: 1.06, h: 0.92 }
      });
    }

    return out;
  }, []);

  useLayoutEffect(() => {
    const el = albumScrollRef.current;
    if (!el) return undefined;
    const run = () => updateAlbumScrollState(el);
    run();
    const ro = new ResizeObserver(run);
    ro.observe(el);
    return () => ro.disconnect();
  }, [cards.length, updateAlbumScrollState]);

  const openProgress = Math.min(scrollTop / 220, 1);
  const introHidden = openProgress > 0.94;

  useEffect(() => {
    if (giftUnwrapped) return undefined;
    if (giftClicks < GIFT_CLICKS_TO_OPEN) return undefined;

    setGiftOpening(true);
    const t = setTimeout(() => {
      setGiftUnwrapped(true);
      setGiftOpening(false);
      setTicketDismissed(false);
    }, GIFT_OPEN_MS);
    return () => clearTimeout(t);
  }, [giftClicks, giftUnwrapped]);

  useEffect(() => {
    if (!giftUnwrapped) {
      setTicketReady(false);
      setTicketFlyout(false);
      return undefined;
    }
    setTicketFlyout(true);
    const t = setTimeout(() => {
      setTicketReady(true);
      setTicketFlyout(false);
    }, TICKET_FLYOUT_MS);
    return () => clearTimeout(t);
  }, [giftUnwrapped]);

  const onGiftClick = useCallback(() => {
    if (giftUnwrapped || giftOpening) return;

    if (giftStageRef.current?.animate) {
      giftStageRef.current.animate(
        [
          { transform: "translate3d(0, 0, 0) scale(1)" },
          { transform: "translate3d(0, 0, 0) scale(0.975)" },
          { transform: "translate3d(0, 0, 0) scale(1.01)" },
          { transform: "translate3d(0, 0, 0) scale(1)" }
        ],
        { duration: 170, easing: "cubic-bezier(0.22, 1, 0.36, 1)" }
      );
    }

    setGiftClicks((prev) => {
      const next = Math.min(GIFT_CLICKS_TO_OPEN, prev + 1);
      const progress = next / GIFT_CLICKS_TO_OPEN;
      setGiftStep(Math.min(GIFT_STEPS, Math.floor(progress * (GIFT_STEPS + 0.0001))));
      return next;
    });
  }, [giftOpening, giftUnwrapped]);
  const ticketVisible = giftUnwrapped && ticketReady && !ticketDismissed;
  const shouldGiftPulse =
    introHidden &&
    giftClicks > 0 &&
    giftClicks <= GIFT_PULSE_UNTIL_CLICKS &&
    !giftOpening &&
    !giftUnwrapped;
  const shouldGiftRumble =
    introHidden &&
    giftClicks > GIFT_PULSE_UNTIL_CLICKS &&
    giftClicks < GIFT_CLICKS_TO_OPEN &&
    !giftOpening &&
    !giftUnwrapped;
  const giftHintText = giftUnwrapped
    ? "Открыто"
    : giftClicks >= 40
      ? "Та-да...!"
      : giftClicks >= 30
        ? "Вот-вот появится!"
        : giftClicks >= 20
          ? "Еще совсем чуть-чуть!"
          : giftClicks >= 10
            ? "Там что-то есть!"
            : "Кликай, чтобы открыть";

  return (
    <main className="album-page">
      <div className="ambient-emojis" aria-hidden="true">
        {FLOAT_EMOJIS.map((e, i) => (
          <span
            key={`${e.symbol}-${i}`}
            className="ambient-emoji"
            style={{
              "--emoji-x": e.x,
              "--emoji-y": e.y,
              "--emoji-delay": e.delay,
              "--emoji-duration": e.dur,
              "--emoji-size": e.size
            }}
          >
            {e.symbol}
          </span>
        ))}
      </div>
      <div
        className={`book-intro${introHidden ? " is-hidden" : ""}`}
        style={{ "--book-open": openProgress }}
      >
        <div className="book-cover-stage">
          <div className="book-hinge-layout">
            <div className="book-spine" aria-hidden="true" />
            <div className="book-pivot">
              <div className="book-board">
                <div className="book-board-face book-board-face--front">
                  <article className="stamp-fly book-cover-stamp" aria-label="Обложка">
                    <div className="stamp-fly-frame">
                      <div className="stamp-fly-field book-cover-field">
                        <div
                          className="book-cover-photo"
                          style={{ backgroundImage: `url(${bookCoverImage})` }}
                        />
                        <div className="book-cover-title-wrap" aria-hidden="true">
                          <p className="book-cover-title">Happy Birthday Album</p>
                        </div>
                        <div className="book-cover-photo-soften" aria-hidden="true" />
                        <div className="book-cover-riso" aria-hidden="true" />
                        <div className="stamp-fly-grain" aria-hidden="true" />
                      </div>
                    </div>
                  </article>
                </div>
                <div className="book-board-face book-board-face--back" aria-hidden="true">
                  <div className="book-board-back-inner">
                    <div className="book-board-back-grain" />
                    <div className="book-board-back-print book-board-back-print--pink" />
                    <div className="book-board-back-print book-board-back-print--blue" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="external">
        <div
          ref={albumScrollRef}
          className="horizontal-scroll-wrapper"
          onScroll={onAlbumScroll}
        >
          {cards.map((card) => (
            <div
              key={card.key}
              className={`img-wrapper ${card.className}`}
              style={{
                "--slot-v-scale": Math.max(card.scale.w, card.scale.h),
                "--gift-step": 0
              }}
            >
              <StampFlyCard
                variant={card.variant}
                tiltDeg={card.tiltDeg}
                image={card.kind === "photo" ? card.image : null}
                imageAlt={card.kind === "photo" ? card.imageAlt : ""}
                scaleW={card.scale.w}
                scaleH={card.scale.h}
              >
                {card.kind === "text" ? <p>{card.text}</p> : null}
                {card.kind === "hearts" ? (
                  <div className="heart-road" aria-hidden="true">
                    <span className="heart-road-line">❤️ ❤️ ❤️ ❤️ ❤️ ❤️ ❤️</span>
                    <span className="heart-road-line">❤️ ❤️ ❤️ ❤️ ❤️ ❤️ ❤️</span>
                    <span className="heart-road-line">❤️ ❤️ ❤️ ❤️ ❤️ ❤️ ❤️</span>
                  </div>
                ) : null}
              </StampFlyCard>
            </div>
          ))}

          <div
            className="img-wrapper slower gift-slot"
            style={{
              "--slot-v-scale": 1.35,
              "--gift-step": giftStep,
              "--slot-ty": "-1vh"
            }}
          >
            <div
              className={`gift-wrapper${introHidden && scrollAtEnd ? " gift-wrapper--active" : ""}${shouldGiftRumble ? " gift-wrapper--rumble" : ""
                }${shouldGiftPulse ? " gift-wrapper--pulse" : ""}${giftOpening ? " gift-wrapper--opening" : ""}${giftUnwrapped ? " gift-wrapper--open" : ""}`}
              aria-label="Подарок"
              role="button"
              tabIndex={0}
              onClick={onGiftClick}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") onGiftClick();
              }}
            >
              <div ref={giftStageRef} className="gift-stage">
                <div className="gift-base" style={{ backgroundImage: `url(${giftBoxImage})` }} />
                <div className="gift-lid" style={{ backgroundImage: `url(${giftBoxImage})` }} />
                <div className="gift-glow" aria-hidden="true" />
                {ticketFlyout || (giftUnwrapped && !ticketReady) ? (
                  <div
                    className={`gift-ticket-flyout${ticketFlyout ? " gift-ticket-flyout--anim" : ""}`}
                    aria-hidden="true"
                  >
                    <div className="ticket-card ticket-card--flyout">
                      <div className="ticket-card__divider" />
                      <p className="ticket-card__title">Билет</p>
                      <p className="ticket-card__subtitle">Большой театр</p>
                    </div>
                  </div>
                ) : null}
                <div className="gift-hint" aria-hidden="true">
                  {giftHintText}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <BolshoiTicketReveal
        open={ticketVisible}
        onDismiss={() => setTicketDismissed(true)}
        onRestart={resetToAlbumStart}
      />
    </main>
  );
}
