import { useEffect } from 'react';
import { findGift, GIFT_CLOSING, GIFT_YEAR } from '../data/gifts.js';
import { Link } from '../router.jsx';
import BouquetViewer from '../components/ar/BouquetViewer.jsx';
import { SITE_NAME } from '../config.js';

const PETALS = Array.from({ length: 12 }, (_, i) => ({
  left: `${(i * 8.3 + 4) % 96}%`,
  delay: `${(i * 1.7) % 9}s`,
  dur: `${11 + (i % 5) * 2}s`,
  size: 10 + (i % 4) * 4,
}));
const GLOWS = Array.from({ length: 14 }, (_, i) => ({ left: `${(i * 7.1 + 3) % 98}%`, top: `${(i * 13.7 + 8) % 92}%`, delay: `${(i * 0.9) % 6}s` }));

// One reusable page for every student — the slug in the address decides whose it is.
export default function GiftPage({ slug }) {
  const gift = findGift(slug);

  useEffect(() => {
    document.title = gift ? `${gift.name} · Happy Children's Day!` : SITE_NAME;
  }, [gift]);

  if (!gift) {
    return (
      <main className="gift gift--missing">
        <div className="gift-card paper paper--framed center page-enter">
          <p className="eyebrow">Hmm…</p>
          <h1 className="login-title">We couldn't find this bouquet</h1>
          <p className="muted">The link may have a typo. Please scan the QR code on your card again, or ask Shadha Mam for help.</p>
          <Link to="/" className="btn btn-primary">
            Go to the front door
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="gift">
      <div className="gift-fx" aria-hidden="true">
        {PETALS.map((p, i) => (
          <span key={i} className="petal" style={{ left: p.left, animationDelay: p.delay, animationDuration: p.dur, width: p.size, height: p.size * 1.3 }} />
        ))}
        {GLOWS.map((g, i) => (
          <span key={i} className="glow" style={{ left: g.left, top: g.top, animationDelay: g.delay }} />
        ))}
      </div>

      <div className="container gift-in page-enter">
        <p className="eyebrow center">Class 8B · Children's Day {GIFT_YEAR}</p>
        <h1 className="gift-hey hand">{gift.greeting}</h1>
        <p className="gift-opener">{gift.opener}</p>

        <BouquetViewer name={gift.name} />

        <section className="gift-card paper paper--framed" aria-label="Your Children's Day message">
          <h2 className="gift-title">HAPPY CHILDREN'S DAY!</h2>
          <p className="gift-name">{gift.name}</p>
          <p className="gift-message">{gift.message}</p>
          <p className="gift-closing hand">{GIFT_CLOSING}</p>
        </section>
        <p className="gift-foot muted">{SITE_NAME}</p>
      </div>
    </main>
  );
}
