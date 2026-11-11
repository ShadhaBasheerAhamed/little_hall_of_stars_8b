import { useEffect, useRef, useState } from 'react';
import { LuPrinter, LuDownload, LuPackage, LuTriangleAlert, LuExternalLink } from 'react-icons/lu';
import AdminBar from '../components/common/AdminBar.jsx';
import QRCode from '../components/qr/QRCode.jsx';
import GreetingCard, { CARD_H, CARD_W } from '../components/ar/GreetingCard.jsx';
import { GIFTS, giftUrl } from '../data/gifts.js';
import { downloadBlob, svgToPngBlob } from '../utils/download.js';
import { makeZip } from '../utils/zip.js';
import { Link } from '../router.jsx';

const URL_KEY = 'lhos.siteurl.v1'; // shared with the login-QR page so the address is typed only once

const readUrl = () => {
  try {
    return localStorage.getItem(URL_KEY) || window.location.href.split('#')[0];
  } catch {
    return window.location.href.split('#')[0];
  }
};

const isLocal = (u) => /^(https?:\/\/)?(localhost|127\.|0\.0\.0\.0|192\.168\.|10\.)/i.test(u.trim()) || /^file:/i.test(u.trim());
const pad = (n) => String(n).padStart(2, '0');

// Draw the card SVG onto a 300-dpi canvas (A6 = 1240 × 1748 px).
function cardToPng(svgEl) {
  return new Promise((resolve, reject) => {
    const px = 12; // pixels per mm
    const xml = new XMLSerializer().serializeToString(svgEl);
    const img = new Image();
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = CARD_W * px;
      c.height = CARD_H * px;
      const ctx = c.getContext('2d');
      ctx.fillStyle = '#fffaf0';
      ctx.fillRect(0, 0, c.width, c.height);
      ctx.drawImage(img, 0, 0, c.width, c.height);
      c.toBlob((b) => (b ? resolve(b) : reject(new Error('PNG failed'))), 'image/png');
    };
    img.onerror = () => reject(new Error('Card image failed'));
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(xml.replace('<svg ', `<svg width="${CARD_W * px}" height="${CARD_H * px}" `));
  });
}

const bytes = async (blob) => new Uint8Array(await blob.arrayBuffer());

export default function GiftAdmin() {
  const [site, setSite] = useState(readUrl);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const qrRefs = useRef({});
  const cardRefs = useRef({});

  useEffect(() => {
    try {
      localStorage.setItem(URL_KEY, site);
    } catch {
      /* ignore */
    }
  }, [site]);

  const clean = site.trim();
  const valid = /^https?:\/\/[^\s]+$/i.test(clean);

  const run = async (label, fn) => {
    setError('');
    setBusy(label);
    try {
      await fn();
    } catch (e) {
      setError(`Sorry, that didn't work (${e.message}). Please try again.`);
    } finally {
      setBusy('');
    }
  };

  const qrName = (g) => `qr-${pad(g.rollNumber)}-${g.slug}.png`;
  const cardName = (g) => `card-${pad(g.rollNumber)}-${g.slug}.png`;

  const oneQR = (g) => run(`qr${g.rollNumber}`, async () => downloadBlob(await svgToPngBlob(qrRefs.current[g.rollNumber], 1024), qrName(g)));
  const oneCard = (g) => run(`card${g.rollNumber}`, async () => downloadBlob(await cardToPng(cardRefs.current[g.rollNumber]), cardName(g)));

  const zipAll = (kind) =>
    run(`zip-${kind}`, async () => {
      const files = [];
      for (const g of GIFTS) {
        const blob = kind === 'qr' ? await svgToPngBlob(qrRefs.current[g.rollNumber], 1024) : await cardToPng(cardRefs.current[g.rollNumber]);
        files.push({ name: kind === 'qr' ? qrName(g) : cardName(g), data: await bytes(blob) });
      }
      downloadBlob(makeZip(files), kind === 'qr' ? 'ar-gift-qr-codes.zip' : 'ar-gift-greeting-cards.zip');
    });

  return (
    <div className="admin gift-admin">
      <AdminBar current="gifts" />
      <main className="container admin-main">
        <div className="no-print">
          <h1 className="admin-title">Children's Day AR Gift — QR &amp; Cards</h1>
          <p className="muted">One flower surprise and one printable card for each of your {GIFTS.length} students. Each QR opens that student's own bouquet page — no PIN needed.</p>

          <label className="field">
            <span className="field-label">Your website address (where the site is published)</span>
            <input className="input" type="url" inputMode="url" value={site} onChange={(e) => setSite(e.target.value)} placeholder="https://your-site.example.com/" />
          </label>
          {!valid && (
            <p className="admin-errors" role="alert">
              Please enter a full address that starts with https://
            </p>
          )}
          {valid && isLocal(clean) && (
            <p className="admin-warn" role="alert">
              <LuTriangleAlert aria-hidden="true" /> This looks like a test address, so phones won't be able to open it. Type the real address of your published site before printing. AR also needs https.
            </p>
          )}
          {error && (
            <p className="admin-errors" role="alert">
              {error}
            </p>
          )}

          <div className="admin-actions gift-actions">
            <button type="button" className="btn btn-primary" disabled={!valid} onClick={() => window.print()}>
              <LuPrinter aria-hidden="true" /> Print all cards (A4, 4 per page)
            </button>
            <button type="button" className="btn btn-ghost" disabled={!valid || !!busy} onClick={() => zipAll('card')}>
              <LuPackage aria-hidden="true" /> {busy === 'zip-card' ? 'Making ZIP…' : 'All cards (ZIP of PNG)'}
            </button>
            <button type="button" className="btn btn-ghost" disabled={!valid || !!busy} onClick={() => zipAll('qr')}>
              <LuPackage aria-hidden="true" /> {busy === 'zip-qr' ? 'Making ZIP…' : 'All QR codes (ZIP of PNG)'}
            </button>
          </div>
          <p className="muted small">Tip: in the print window choose “Save as PDF” to get one PDF of all cards, and set Margins to “Default” and Scale to 100%.</p>
        </div>

        {valid && (
          <section className="gift-sheet" aria-label="Printable greeting cards">
            {GIFTS.map((g) => {
              const url = giftUrl(clean, g);
              return (
                <article key={g.id} className="gcard">
                  <GreetingCard ref={(el) => (cardRefs.current[g.rollNumber] = el)} name={g.name} url={url} className="gcard-svg" />
                  {/* hidden plain QR used for the QR-only PNG downloads */}
                  <QRCode ref={(el) => (qrRefs.current[g.rollNumber] = el)} value={url} className="gcard-qr" label={`QR code for ${g.name}`} />
                  <div className="gcard-tools no-print">
                    <p className="gcard-name">
                      <strong>{g.name}</strong>
                      <small>/gift/{g.slug}</small>
                    </p>
                    <span className="gcard-btns">
                      <button type="button" className="btn btn-ghost btn-sm" disabled={!!busy} onClick={() => oneCard(g)} aria-label={`Download card for ${g.name}`}>
                        <LuDownload aria-hidden="true" /> Card
                      </button>
                      <button type="button" className="btn btn-ghost btn-sm" disabled={!!busy} onClick={() => oneQR(g)} aria-label={`Download QR code for ${g.name}`}>
                        <LuDownload aria-hidden="true" /> QR
                      </button>
                      <Link className="btn btn-ghost btn-sm" to={`/gift/${g.slug}`} aria-label={`Open ${g.name}'s gift page`}>
                        <LuExternalLink aria-hidden="true" /> Open
                      </Link>
                    </span>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </main>
    </div>
  );
}
