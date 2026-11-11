import { useEffect, useRef, useState } from 'react';
import { LuPrinter, LuDownload, LuTriangleAlert } from 'react-icons/lu';
import AdminBar from '../components/common/AdminBar.jsx';
import QRCode from '../components/qr/QRCode.jsx';
import Sparkle from '../components/common/Sparkle.jsx';
import { downloadBlob, slug, svgToPngBlob } from '../utils/download.js';

const URL_KEY = 'lhos.siteurl.v1';
const PIN_KEY = 'lhos.printpin.v1';

function defaultSiteUrl() {
  return window.location.href.split('#')[0];
}

function readStored(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v === null ? fallback : v;
  } catch {
    return fallback;
  }
}

function writeStored(key, val) {
  try {
    localStorage.setItem(key, val);
  } catch {
    /* ignore */
  }
}

const isLocal = (u) => /^(https?:\/\/)?(localhost|127\.|0\.0\.0\.0|192\.168\.|10\.)/i.test(u.trim()) || /^file:/i.test(u.trim());

export default function QRGenerator({ students }) {
  const [site, setSite] = useState(() => readStored(URL_KEY, defaultSiteUrl()));
  const [showPin, setShowPin] = useState(() => readStored(PIN_KEY, '1') === '1');
  const [busy, setBusy] = useState('');
  const refs = useRef({});

  useEffect(() => writeStored(URL_KEY, site), [site]);
  useEffect(() => writeStored(PIN_KEY, showPin ? '1' : '0'), [showPin]);

  const clean = site.trim();
  const valid = /^https?:\/\/[^\s]+$/i.test(clean);
  // The QR opens the login page (never a student's page) — the PIN is still needed.
  const link = (s) => `${clean.split('#')[0]}#/?star=${s.rollNumber}`;

  const downloadOne = async (s) => {
    const el = refs.current[s.rollNumber];
    if (!el) return;
    setBusy(String(s.rollNumber));
    try {
      const blob = await svgToPngBlob(el, 1024);
      downloadBlob(blob, `qr-${String(s.rollNumber).padStart(2, '0')}-${slug(s.name)}.png`);
    } finally {
      setBusy('');
    }
  };

  return (
    <div className="admin qr-admin">
      <AdminBar current="qr" />
      <main className="container admin-main">
        <div className="no-print">
          <h1 className="admin-title">QR cards</h1>
          <p className="muted">One card per student. Scanning opens the login page — each student still needs their own PIN.</p>

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
              <LuTriangleAlert aria-hidden="true" /> This looks like a test address. Phones won't be able to open it. Once the site is published, type its real address above before printing.
            </p>
          )}
          <label className="check">
            <input type="checkbox" checked={showPin} onChange={(e) => setShowPin(e.target.checked)} />
            <span>Print each student's PIN on their card</span>
          </label>
          <p>
            <button type="button" className="btn btn-primary" disabled={!valid} onClick={() => window.print()}>
              <LuPrinter aria-hidden="true" /> Print all cards (A4)
            </button>
          </p>
        </div>

        {valid && (
          <section className="qr-sheet" aria-label="Printable QR cards">
            {students.map((s) => (
              <article key={s.rollNumber} className="qr-card">
                <p className="qr-brand">
                  <Sparkle className="qr-brand-star" /> The Little Hall of Stars
                </p>
                <QRCode ref={(el) => (refs.current[s.rollNumber] = el)} value={link(s)} className="qr-img" label={`QR code for ${s.name}`} />
                <h2 className="qr-name">{s.name}</h2>
                <p className="qr-meta">
                  Roll No. {s.rollNumber} · Class 8B{showPin ? ` · PIN ${s.pin}` : ''}
                </p>
                <p className="qr-scan hand">Scan to open your little world</p>
                <button type="button" className="btn btn-ghost btn-sm no-print" disabled={busy === String(s.rollNumber)} onClick={() => downloadOne(s)} aria-label={`Download ${s.name}'s QR code`}>
                  <LuDownload aria-hidden="true" /> Download PNG
                </button>
              </article>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}
