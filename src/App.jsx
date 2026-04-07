import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import { birthdayMessageRu } from "./data/message";
import { getAlbumPhotoUrls } from "./data/albumPhotos";
import bookCoverImage from "../assets/4065863.jpg";
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
  { w: 1.32, h: 1.46 },
  { w: 1.24, h: 1.38 },
  { w: 1.41, h: 1.33 },
  { w: 1.28, h: 1.52 }
];

const SCROLL_END_PX = 24;

export default function App() {
  const [scrollTop, setScrollTop] = useState(0);
  const [scrollAtEnd, setScrollAtEnd] = useState(false);
  const [ticketDismissed, setTicketDismissed] = useState(false);

  const albumScrollRef = useRef(null);

  const updateAlbumScrollState = useCallback((el) => {
    setScrollTop(el.scrollTop);
    const gap = el.scrollHeight - el.scrollTop - el.clientHeight;
    const nearEnd = gap <= SCROLL_END_PX;
    setScrollAtEnd(nearEnd);
    if (!nearEnd) setTicketDismissed(false);
  }, []);

  const onAlbumScroll = useCallback(
    (e) => updateAlbumScrollState(e.currentTarget),
    [updateAlbumScrollState]
  );

  const cards = useMemo(() => {
    const photos = getAlbumPhotoUrls();
    const { recipientName, headline, lines, signature } = birthdayMessageRu;
    let photoSlot = 0;

    const blocks = [
      {
        key: "headline",
        kind: "text",
        text: headline,
        className: "slower",
        variant: "cream",
        tiltDeg: -2.2,
        scale: TEXT_SCALES[0]
      },
      ...lines.map((text, i) => ({
        key: `line-${i}`,
        kind: "text",
        text,
        className: ["faster", "slower vertical", "slower slower-down"][i],
        variant: ["sage", "blush", "linen"][i],
        tiltDeg: [1.6, -1.4, 2.4][i],
        scale: TEXT_SCALES[i + 1]
      })),
      {
        key: "sign",
        kind: "text",
        text: `С любовью, ${signature}`,
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
      const isBeforeSignature = i < blocks.length - 1;
      const image = isBeforeSignature ? photos[photoSlot] : undefined;
      if (image) {
        const slot = photoSlot;
        photoSlot += 1;
        out.push({
          key: `photo-${slot}`,
          kind: "photo",
          image,
          imageAlt: recipientName ? `Фото — ${recipientName}` : "Фото",
          className: ["faster", "slower vertical", "faster1", "faster"][slot % 4],
          variant: ["sage", "blush", "linen", "parchment"][slot % 4],
          tiltDeg: [1.35, -1.15, 1.75, -1.55][slot % 4],
          scale: PHOTO_SCALES[slot % PHOTO_SCALES.length]
        });
      }
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
  const ticketVisible = introHidden && scrollAtEnd && !ticketDismissed;

  return (
    <main className="album-page">
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
                "--slot-v-scale": Math.max(card.scale.w, card.scale.h)
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
              </StampFlyCard>
            </div>
          ))}
        </div>
      </div>

      <BolshoiTicketReveal open={ticketVisible} onDismiss={() => setTicketDismissed(true)} />
    </main>
  );
}
