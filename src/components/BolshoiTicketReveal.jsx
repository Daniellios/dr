import { bolshoiTicket as t } from "../data/bolshoiTicket";

function FakeBarcode() {
  const pattern = [2, 1, 3, 1, 2, 1, 1, 3, 2, 1, 2, 2, 1, 3, 1, 2, 1, 3, 2, 1, 1, 2, 3, 1, 2, 1, 2, 1, 3, 1, 2, 2, 1, 3, 2, 1];
  return (
    <div className="ticket-barcode" aria-hidden="true">
      {pattern.map((w, i) => (
        <span key={i} className="ticket-barcode-bar" style={{ width: w }} />
      ))}
    </div>
  );
}

function FakeQr() {
  return (
    <div className="ticket-qr" aria-hidden="true">
      {Array.from({ length: 49 }, (_, i) => (
        <span
          key={i}
          className={`ticket-qr-cell${(i * 7 + 13) % 5 < 2 ? " ticket-qr-cell--on" : ""}`}
        />
      ))}
    </div>
  );
}

export default function BolshoiTicketReveal({ open, onDismiss }) {
  if (!open) return null;

  return (
    <div className="ticket-reveal" role="dialog" aria-modal="true" aria-labelledby="ticket-title">
      <button type="button" className="ticket-reveal-backdrop" onClick={onDismiss} aria-label="Закрыть" />
      <div className="ticket-reveal-panel">
        <article className="ticket-card">
          <header className="ticket-card__head">
            <div className="ticket-card__logo" aria-hidden="true">
              <span className="ticket-card__logo-ring" />
            </div>
            <div className="ticket-card__venues">
              <p className="ticket-card__venue-main">{t.venueShort}</p>
              <p className="ticket-card__venue-sub">
                {t.historicalStage}, {t.entrance}
              </p>
            </div>
          </header>

          <h2 id="ticket-title" className="ticket-card__title">
            {t.title}
          </h2>
          <p className="ticket-card__subtitle">{t.subtitle}</p>
          <p className="ticket-card__performer">{t.performer}</p>

          <div className="ticket-card__row ticket-card__row--highlight">
            <time dateTime="2026-04-25T19:00">
              <span className="ticket-card__date">{t.dateLine}</span>
              <span className="ticket-card__time">{t.time}</span>
            </time>
          </div>

          <div className="ticket-card__divider" />

          <p className="ticket-card__meta">
            <span className="ticket-card__meta-label">{t.visitorLabel}:</span> {t.visitorName}
          </p>
          <p className="ticket-card__meta">
            {t.ticketType} {t.ticketNumber}
          </p>

          <p className="ticket-card__id-rule">{t.idNote}</p>

          <div className="ticket-card__codes">
            <FakeBarcode />
          </div>
        </article>

        <button type="button" className="ticket-reveal-close" onClick={onDismiss}>
          Иду!
        </button>
      </div>
    </div>
  );
}
