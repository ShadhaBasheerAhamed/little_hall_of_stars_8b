import { useMemo, useRef, useState } from 'react';
import { LuDownload, LuUpload, LuPencil, LuEye, LuSearch } from 'react-icons/lu';
import AdminBar from '../components/common/AdminBar.jsx';
import { Link } from '../router.jsx';
import { downloadText } from '../utils/download.js';
import { getAllStudents, getOverridesForExport, hasLocalEdits, importOverrides } from '../hooks/useContent.js';

export default function AdminDashboard({ students }) {
  const [q, setQ] = useState('');
  const [msg, setMsg] = useState('');
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
      setMsg(`Loaded edits for ${Object.keys(data).length} student(s) on this device.`);
    } catch {
      setMsg('That file could not be read. Please choose an overrides.json you exported earlier.');
    }
  };

  return (
    <div className="admin">
      <AdminBar current="dashboard" />
      <main className="container admin-main">
        <h1 className="admin-title">Your 29 little stars</h1>
        <p className="muted">
          Edit anything a student sees — no code needed. Changes are saved on this device straight away; use “Save my edits” to keep a copy or to publish them for everyone.
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
                <Link className="btn btn-primary btn-sm" to={`/admin/student/${s.rollNumber}`} aria-label={`Edit ${s.name}`}>
                  <LuPencil aria-hidden="true" /> Edit
                </Link>
                <Link className="btn btn-ghost btn-sm" to={`/admin/preview/${s.rollNumber}`} aria-label={`Preview ${s.name}'s page`}>
                  <LuEye aria-hidden="true" /> Preview
                </Link>
              </span>
            </li>
          ))}
        </ul>
        {shown.length === 0 && <p className="center muted">No student matches “{q}”.</p>}
      </main>
    </div>
  );
}
