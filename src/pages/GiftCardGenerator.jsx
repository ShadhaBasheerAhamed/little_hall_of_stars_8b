import { useEffect, useMemo, useRef, useState } from 'react';
import { LuDownload, LuPrinter, LuSearch, LuFileArchive, LuFileText, LuImage, LuEye } from 'react-icons/lu';
import AdminBar from '../components/common/AdminBar.jsx';
import QRCode from '../components/qr/QRCode.jsx';
import Sparkle from '../components/common/Sparkle.jsx';
import { downloadBlob, svgToPngBlob, generateQRCodeBlob, generateAllQRCodeBlobs, slug } from '../utils/download.js';

const LIVE_SITE_URL = 'https://littlehallofstarsmy8b.netlify.app/';

function isLocal(u) {
  return /^(https?:\/\/)?(localhost|127\.|0\.0\.0\.0|192\.168\.|10\.)/i.test(u.trim()) || /^file:/i.test(u.trim());
}

function defaultSiteUrl() {
  const current = window.location.href.split('#')[0];
  return isLocal(current) ? LIVE_SITE_URL : current;
}

const CARD_WIDTH = 380;
const CARD_HEIGHT = 540;

export default function GiftCardGenerator({ students }) {
  const [site, setSite] = useState(() => defaultSiteUrl());
  const [q, setQ] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const cardRefs = useRef({});

  const shown = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return students;
    return students.filter((s) => s.name.toLowerCase().includes(t) || String(s.rollNumber) === t || s.pin === t);
  }, [students, q]);

  const clean = site.trim();
  const valid = /^https?:\/\//i.test(clean);
  const link = (s) => `${clean.split('#')[0]}#/?star=${s.rollNumber}`;

  const downloadCardPNG = async (student) => {
    const el = cardRefs.current[student.rollNumber];
    if (!el) return;
    setBusy(true);
    try {
      const canvas = document.createElement('canvas');
      const scale = 3;
      canvas.width = CARD_WIDTH * scale;
      canvas.height = CARD_HEIGHT * scale;
      const ctx = canvas.getContext('2d');
      ctx.scale(scale, scale);
      ctx.fillStyle = '#fffdf6';
      ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);
      await renderElementToCanvas(el, ctx, 0, 0, CARD_WIDTH, CARD_HEIGHT);
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png', 1.0));
      downloadBlob(blob, `gift-card-${String(student.rollNumber).padStart(2, '0')}-${slug(student.name)}.png`);
      setMsg(`Downloaded ${student.name}'s gift card.`);
    } catch (err) {
      console.error(err);
      setMsg('Failed to download card. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const downloadAllPDF = async () => {
    if (!valid) { setMsg('Please enter a valid website address.'); return; }
    setBusy(true);
    setMsg('Generating PDF…');
    try {
      const { PDFDocument, rgb } = await import('pdf-lib');
      const pdfDoc = await PDFDocument.create();
      
      const pageWidth = 595.28;
      const pageHeight = 841.89;
      const margin = 36;
      const gapX = 24;
      const gapY = 24;
      const cardW = (pageWidth - 2 * margin - gapX) / 2;
      const cardH = cardW * (CARD_HEIGHT / CARD_WIDTH);
      const cols = 2;
      const rows = Math.floor((pageHeight - 2 * margin) / (cardH + gapY));
      const maxPerPage = cols * rows;
      
      const blobs = await generateAllQRCodeBlobs(students, clean);
      const qrMap = new Map(blobs.map(({ student, blob }) => [student.rollNumber, blob]));

      let page = pdfDoc.addPage([pageWidth, pageHeight]);
      let x = margin;
      let y = pageHeight - margin;
      let count = 0;

      for (const student of students) {
        if (count > 0 && count % maxPerPage === 0) {
          page = pdfDoc.addPage([pageWidth, pageHeight]);
          x = margin;
          y = pageHeight - margin;
        }

        const cardX = x;
        const cardY = y - cardH;

        // Card background
        page.drawRectangle({ x: cardX, y: cardY, width: cardW, height: cardH, color: rgb(0.99, 0.98, 0.96), borderColor: rgb(0.9, 0.8, 0.85), borderWidth: 1.5, borderRadius: 12 });

        // Draw content as text (simplified for PDF)
        let textY = cardY + cardH - 32;
        const centerX = cardX + cardW / 2;

        page.drawText('LITTLE HALL OF STARS', { x: centerX - 90, y: textY, size: 14, color: rgb(0.1, 0.2, 0.35), font: await pdfDoc.embedFont(await fetch('https://fonts.gstatic.com/s/playfairdisplay/v30/nuFRD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKeiunLBqRs.woff2').then(r => r.arrayBuffer())) });
        textY -= 22;
        page.drawText('GRADE 8B · 2026', { x: centerX - 55, y: textY, size: 10, color: rgb(0.3, 0.35, 0.45) });
        textY -= 30;
        page.drawText('A LITTLE UNIVERSE CREATED ESPECIALLY FOR', { x: centerX - 110, y: textY, size: 9, color: rgb(0.3, 0.35, 0.45) });
        textY -= 20;
        page.drawText(student.name, { x: centerX - (student.name.length * 5), y: textY, size: 16, color: rgb(0.1, 0.2, 0.35) });
        textY -= 18;
        page.drawText('Roll No. ' + student.rollNumber, { x: centerX - 35, y: textY, size: 11, color: rgb(0.2, 0.25, 0.4) });
        textY -= 18;
        page.drawText('SCAN TO ENTER YOUR LITTLE UNIVERSE ✨', { x: centerX - 100, y: textY, size: 9, color: rgb(0.17, 0.4, 0.67) });
        textY -= 22;
        page.drawText('"Keep learning, keep exploring,', { x: centerX - 80, y: textY, size: 9, color: rgb(0.4, 0.45, 0.55) });
        textY -= 14;
        page.drawText('and keep shining!"', { x: centerX - 55, y: textY, size: 9, color: rgb(0.4, 0.45, 0.55) });
        textY -= 20;
        page.drawText('With Love, Shadha Mam ♡', { x: centerX - 70, y: textY, size: 10, color: rgb(0.7, 0.35, 0.33) });
        textY -= 16;
        page.drawText('Computer Science Staff · Grade 8', { x: centerX - 85, y: textY, size: 8, color: rgb(0.5, 0.55, 0.6) });

        // QR Code
        const qrBlob = qrMap.get(student.rollNumber);
        if (qrBlob) {
          const pngBytes = await qrBlob.arrayBuffer();
          const pngImage = await pdfDoc.embedPng(pngBytes);
          const qrSize = 80;
          page.drawImage(pngImage, { x: centerX - qrSize/2, y: textY - qrSize - 10, width: qrSize, height: qrSize });
        }

        x += cardW + gapX;
        if ((count + 1) % cols === 0 && count < students.length - 1) {
          x = margin;
          y -= cardH + gapY;
        }
        count++;
      }

      const pdfBytes = await pdfDoc.save();
      downloadBlob(new Blob([pdfBytes], { type: 'application/pdf' }), 'gift-cards-all.pdf');
      setMsg(`Downloaded all ${students.length} gift cards as PDF.`);
    } catch (err) {
      console.error(err);
      setMsg('Failed to create PDF. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const downloadAllQRZip = async () => {
    if (!valid) { setMsg('Please enter a valid website address.'); return; }
    setBusy(true);
    setMsg('Generating ZIP…');
    try {
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      const blobs = await generateAllQRCodeBlobs(students, clean);
      blobs.forEach(({ student, blob }) => {
        zip.file(`qr-${String(student.rollNumber).padStart(2, '0')}-${slug(student.name)}.png`, blob);
      });
      const content = await zip.generateAsync({ type: 'blob' });
      downloadBlob(content, 'all-qr-codes.zip');
      setMsg(`Downloaded all ${students.length} QR codes as ZIP.`);
    } catch (err) {
      console.error(err);
      setMsg('Failed to create ZIP.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="admin gift-admin">
      <AdminBar current="gifts" />
      <main className="container admin-main">
        <div className="no-print">
          <h1 className="admin-title">Gift Card Generator</h1>
          <p className="muted">Beautiful personalised cards for each star. Two cards per A4 row, ready to print and gift.</p>

          <label className="field">
            <span className="field-label">Website address (for QR links)</span>
            <input className="input" type="url" inputMode="url" value={site} onChange={(e) => setSite(e.target.value)} placeholder="https://littlehallofstarsmy8b.netlify.app/" />
          </label>
          {!valid && <p className="admin-errors">Please enter a full address starting with https://</p>}
          {valid && isLocal(clean) && <p className="admin-warn"><LuFileArchive aria-hidden="true" /> This is a local address. Use the live Netlify URL before printing.</p>}

          <label className="search" style={{ maxWidth: 360, marginTop: 16 }}>
            <LuSearch aria-hidden="true" />
            <input className="input" type="search" placeholder="Search by name or roll number" value={q} onChange={(e) => setQ(e.target.value)} />
          </label>

          <div className="admin-actions" style={{ marginTop: 16, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button className="btn btn-primary" disabled={!valid || busy} onClick={downloadAllPDF}>
              <LuFileText aria-hidden="true" /> {busy ? 'Generating…' : 'Download All Cards as PDF (A4)'}
            </button>
            <button className="btn btn-primary" disabled={!valid || busy} onClick={downloadAllQRZip}>
              <LuFileArchive aria-hidden="true" /> {busy ? 'Generating…' : 'Download All QR Codes as ZIP'}
            </button>
            <button className="btn btn-ghost" disabled={busy} onClick={() => window.print()}>
              <LuPrinter aria-hidden="true" /> Print All Cards
            </button>
          </div>

          {msg && <p className="admin-msg" role="status">{msg}</p>}
        </div>

        <section className="gift-sheet" aria-label="Printable gift cards">
          {shown.map((s) => (
            <article key={s.rollNumber} ref={(el) => (cardRefs.current[s.rollNumber] = el)} className="gift-card paper--framed page-enter">
              <div className="gift-card-inner">
                <p className="gift-brand">
                  <Sparkle className="gift-brand-star" /> LITTLE HALL OF STARS
                </p>
                <p className="gift-class">GRADE 8B · 2026</p>
                <p className="gift-subtitle">A LITTLE UNIVERSE CREATED ESPECIALLY FOR</p>
                <h2 className="gift-name">{s.name}</h2>
                <p className="gift-roll">Roll No. {s.rollNumber}</p>
                
                <div className="gift-qr-wrapper">
                  <QRCode value={link(s)} className="gift-qr" label={`QR code for ${s.name}`} />
                </div>
                
                <p className="gift-scan">SCAN TO ENTER YOUR LITTLE UNIVERSE <Sparkle className="gift-scan-star" /></p>
                <blockquote className="gift-quote">"Keep learning, keep exploring, and keep shining!"</blockquote>
                <footer className="gift-footer">
                  <p className="gift-love">With Love, Shadha Mam ♡</p>
                  <p className="gift-role">Computer Science Staff · Grade 8</p>
                </footer>
              </div>
              
              <div className="gift-card-tools no-print">
                <button className="btn btn-ghost btn-sm" disabled={busy} onClick={() => downloadCardPNG(s)}>
                  <LuImage aria-hidden="true" /> Download PNG
                </button>
                <button className="btn btn-ghost btn-sm" disabled={busy} onClick={() => window.open(`./#/?star=${s.rollNumber}`, '_blank')}>
                  <LuEye aria-hidden="true" /> Preview Page
                </button>
              </div>
            </article>
          ))}
        </section>

        {shown.length === 0 && <p className="center muted no-print">No student matches "{q}".</p>}
      </main>
    </div>
  );
}

async function renderElementToCanvas(el, ctx, x, y, w, h) {
  const data = await htmlToCanvasData(el);
  const img = new Image();
  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
    img.src = data;
  });
  ctx.drawImage(img, x, y, w, h);
}

function htmlToCanvasData(el) {
  const clone = el.cloneNode(true);
  clone.style.position = 'absolute';
  clone.style.left = '-9999px';
  clone.style.top = '0';
  clone.style.width = CARD_WIDTH + 'px';
  clone.style.height = CARD_HEIGHT + 'px';
  clone.style.transform = 'none';
  document.body.appendChild(clone);
  
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${CARD_WIDTH}" height="${CARD_HEIGHT}">
      <foreignObject width="100%" height="100%">
        ${clone.outerHTML}
      </foreignObject>
    </svg>
  `;
  
  document.body.removeChild(clone);
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}