import { useMemo, useRef, useState } from 'react';
import { LuDownload, LuUpload, LuPencil, LuEye, LuSearch, LuFileArchive, LuFileText } from 'react-icons/lu';
import AdminBar from '../components/common/AdminBar.jsx';
import { Link } from '../router.jsx';
import { downloadText, generateAllQRCodeBlobs } from '../utils/download.js';
import { getAllStudents, getOverridesForExport, hasLocalEdits, importOverrides } from '../hooks/useContent.js';

const LIVE_SITE_URL = 'https://littlehallofstarsmy8b.netlify.app/';

function isLocal(u) {
  return /^(https?:\/\/)?(localhost|127\.|0\.0\.0\.0|192\.168\.|10\.)/i.test(u.trim()) || /^file:/i.test(u.trim());
}

function defaultSiteUrl() {
  const current = window.location.href.split('#')[0];
  return isLocal(current) ? LIVE_SITE_URL : current;
}

export default function AdminDashboard({ students }) {
  const [q, setQ] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const [siteUrl, setSiteUrl] = useState(() => defaultSiteUrl());
  const fileRef = useRef(null);

  const shown = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return students;
    return students.filter((s) => s.name.toLowerCase().includes(t) || String(s.rollNumber) === t || s.pin === t);
  }, [students, q]);

  const exportAll = () => downloadText(JSON.stringify(getAllStudents(), null, 2), 'little-hall-of-stars-students.json');
  const exportEdits = () => {
    downloadText(JSON.stringify(getOverridesForExport(), null, 2), 'overrides.json');
    setMsg('Saved overrides.json. Put it in src/data/ and rebuild to publish your edits for everyone.');
  };
  const onImport = async (e) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('bad');
      importOverrides(data);
      setMsg('Loaded edits for ' + Object.keys(data).length + ' student(s) on this device.');
    } catch {
      setMsg('That file could not be read. Please choose an overrides.json you exported earlier.');
    }
  };

  const downloadAllZip = async () => {
    const clean = siteUrl.trim();
    if (!/^https?:\/\//i.test(clean)) {
      setMsg('Please enter a valid website address starting with https://');
      return;
    }
    setBusy(true);
    setMsg('Generating QR codes...');
    try {
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      const blobs = await generateAllQRCodeBlobs(students, clean);
      blobs.forEach(({ student, blob }) => {
        const filename = 'qr-' + String(student.rollNumber).padStart(2, '0') + '-' + slug(student.name) + '.png';
        zip.file(filename, blob);
      });
      const content = await zip.generateAsync({ type: 'blob' });
      downloadBlob(content, 'all-qr-codes.zip');
      setMsg('Downloaded all ' + students.length + ' QR codes as ZIP.');
    } catch (err) {
      console.error(err);
      setMsg('Failed to create ZIP. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const downloadAllPdf = async () => {
    const clean = siteUrl.trim();
    if (!/^https?:\/\//i.test(clean)) {
      setMsg('Please enter a valid website address starting with https://');
      return;
    }
    setBusy(true);
    setMsg('Generating PDF...');
    try {
      const { PDFDocument, rgb } = await import('pdf-lib');
      const pdfDoc = await PDFDocument.create();
      const blobs = await generateAllQRCodeBlobs(students, clean);
      
      const pageWidth = 595.28;
      const pageHeight = 841.89;
      const margin = 28;
      const cardWidth = 130;
      const cardHeight = 160;
      const gapX = 20;
      const gapY = 20;
      const cols = 3;
      const maxPerPage = cols * 5;
      
      let page = pdfDoc.addPage([pageWidth, pageHeight]);
      let x = margin;
      let y = pageHeight - margin;
      
      for (let i = 0; i < blobs.length; i++) {
        const { student, blob } = blobs[i];
        
        if (i > 0 && i % maxPerPage === 0) {
          page = pdfDoc.addPage([pageWidth, pageHeight]);
          x = margin;
          y = pageHeight - margin;
        }
        
        const pngBytes = await blob.arrayBuffer();
        const pngImage = await pdfDoc.embedPng(pngBytes);
        
        page.drawImage(pngImage, {
          x,
          y: y - 80,
          width: 80,
          height: 80,
        });
        
        page.drawText(student.name, {
          x,
          y: y - 100,
          size: 10,
          color: rgb(0.15, 0.2, 0.3),
        });
        
        page.drawText('Roll No. ' + student.rollNumber, {
          x,
          y: y - 114,
          size: 9,
          color: rgb(0.3, 0.35, 0.45),
        });
        
        x += cardWidth + gapX;
        if ((i + 1) % cols === 0 && i < blobs.length - 1) {
          x = margin;
          y -= cardHeight + gapY;
        }
      }
      
      const pdfBytes = await pdfDoc.save();
      downloadBlob(new Blob([pdfBytes], { type: 'application/pdf' }), 'all-qr-codes.pdf');
      setMsg('Downloaded all ' + students.length + ' QR codes as PDF.');
    } catch (err) {
      console.error(err);
      setMsg('Failed to create PDF. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="admin">
      <AdminBar current="dashboard" />
      <main className="container admin-main">
        <h1 className="admin-title">Your 29 little stars</h1>
        <p className="muted">
          Edit anything a student sees — no code needed. Changes are saved on this device straight away; use "Save my edits" to keep a copy or to publish them for everyone.
        </p>

        <div className="admin-tools">
          <label className="search">
            <LuSearch aria-hidden="true" />
            <span className="sr-only">Search by name or roll number</span>
            <input className="input" type="search" placeholder="Search by name or roll number" value={q} onChange={(e) => setQ(e.target.value)} />
          </label>
          <div className="admin-actions">
            <button type="button" className="btn btn-ghost btn-sm" onClick={exportAll}>
              <LuDownload aria-hidden="true" /> Export all (JSON)
            </button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={exportEdits}>
              <LuDownload aria-hidden="true" /> Save my edits
            </button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => fileRef.current && fileRef.current.click()}>
              <LuUpload aria-hidden="true" /> Load edits
            </button>
            <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={onImport} />
          </div>
        </div>
        
        <div className="admin-tools" style={{ marginTop: '1.5rem' }}>
          <label className="field" style={{ maxWidth: '520px' }}>
            <span className="field-label">Website address (for QR code links)</span>
            <input className="input" type="url" inputMode="url" value={siteUrl} onChange={(e) => setSiteUrl(e.target.value)} placeholder="https://littlehallofstarsmy8b.netlify.app/" />
          </label>
          <div className="admin-actions" style={{ marginTop: '8px' }}>
            <button type="button" className="btn btn-primary btn-sm" disabled={busy} onClick={downloadAllZip}>
              <LuFileArchive aria-hidden="true" /> {busy ? 'Generating...' : 'Download All as ZIP'}
            </button>
            <button type="button" className="btn btn-primary btn-sm" disabled={busy} onClick={downloadAllPdf}>
              <LuFileText aria-hidden="true" /> {busy ? 'Generating...' : 'Download All as PDF'}
            </button>
          </div>
        </div>

        {msg && (
          <p className="admin-msg" role="status">
            {msg}
          </p>
        )}

        <p className="muted" aria-live="polite">
          Showing {shown.length} of {students.length}
        </p>
        <ul className="student-list">
          {shown.map((s) => (
            <li key={s.rollNumber} className="student-row paper">
              <span className="student-roll" aria-hidden="true">
                {s.rollNumber}
              </span>
              <span className="student-info">
                <strong>{s.name}</strong>
                <small>
                  Roll No. {s.rollNumber} · PIN {s.pin}
                  {hasLocalEdits(s.rollNumber) && <em className="edited"> · edited</em>}
                </small>
              </span>
              <span className="student-btns">
                <Link className="btn btn-primary btn-sm" to={'/admin/student/' + s.rollNumber} aria-label={'Edit ' + s.name}>
                  <LuPencil aria-hidden="true" /> Edit
                </Link>
                <Link className="btn btn-ghost btn-sm" to={'/admin/preview/' + s.rollNumber} aria-label={'Preview ' + s.name + '\'s page'}>
                  <LuEye aria-hidden="true" /> Preview
                </Link>
              </span>
            </li>
          ))}
        </ul>
        {shown.length === 0 && <p className="center muted">No student matches "{q}".</p>}
      </main>
    </div>
  );
}

function slug(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}