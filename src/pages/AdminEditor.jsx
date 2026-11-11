import { useMemo, useState } from 'react';
import { LuArrowLeft, LuEye, LuSave, LuRotateCcw } from 'react-icons/lu';
import AdminBar from '../components/common/AdminBar.jsx';
import { Link } from '../router.jsx';
import { STRENGTHS, STRENGTH_IDS } from '../data/catalog.js';
import { BASE_STUDENTS, FILE_OVERRIDES } from '../data/students.js';
import { hasLocalEdits, resetOverride, setOverride } from '../hooks/useContent.js';

const REQUIRED_END = 'Someone believed in you enough to create this little world just for you. Never forget that.';

// Editable text fields. kind: line | text | lines (one item per line)
const FIELDS = [
  { group: 'Welcome & introduction', items: [
    { key: 'welcomeNote', label: 'Welcome note', kind: 'text', rows: 3 },
    { key: 'introduction', label: 'Section 01 · Introduction', kind: 'text', rows: 3 },
    { key: 'quote', label: 'Section 01 · Quote', kind: 'text', rows: 2 },
  ] },
  { group: 'Section 02 · What makes you special', items: [
    { key: 'appreciationMessage', label: 'Appreciation message (blank line = new paragraph)', kind: 'text', rows: 9 },
  ] },
  { group: 'Section 04 · Letter to future self', items: [
    { key: 'letterToFutureSelf', label: 'Future-self letter', kind: 'text', rows: 14 },
  ] },
  { group: 'Section 05 · Magazine cover', items: [
    { key: 'magazineHeadline', label: 'Headline', kind: 'line' },
    { key: 'magazineSubtitle', label: 'Subtitle', kind: 'line' },
    { key: 'magazineEditorials', label: 'Inside this edition (3–4 lines, one per line)', kind: 'lines', rows: 4 },
    { key: 'magazineDescription', label: 'Footer line', kind: 'text', rows: 2 },
  ] },
  { group: 'Section 06 · Character card', items: [
    { key: 'characterName', label: 'Character name', kind: 'line' },
    { key: 'characterType', label: 'Character type', kind: 'line' },
    { key: 'characterAttributes', label: 'Special abilities (exactly 5, one per line)', kind: 'lines', rows: 5 },
  ] },
  { group: 'Section 07 · Open when you doubt yourself', items: [
    { key: 'encouragementLetter', label: 'Encouragement letter', kind: 'text', rows: 14 },
  ] },
  { group: 'Section 08 & extras', items: [
    { key: 'finalMessage', label: 'Final message', kind: 'text', rows: 10 },
    { key: 'timeCapsule', label: 'Time-capsule message', kind: 'text', rows: 9 },
  ] },
];

const toForm = (s) => {
  const f = { strengths: s.strengths.slice() };
  FIELDS.forEach((g) =>
    g.items.forEach((it) => {
      f[it.key] = it.kind === 'lines' ? s[it.key].join('\n') : s[it.key];
    }),
  );
  return f;
};

const fromForm = (f) => {
  const out = { strengths: f.strengths.slice() };
  FIELDS.forEach((g) =>
    g.items.forEach((it) => {
      out[it.key] = it.kind === 'lines' ? f[it.key].split('\n').map((x) => x.trim()).filter(Boolean) : f[it.key].trim();
    }),
  );
  return out;
};

function validate(v) {
  const errs = [];
  if (v.strengths.length < 4 || v.strengths.length > 6) errs.push('Choose between 4 and 6 superpowers.');
  if (v.characterAttributes.length !== 5) errs.push('The character card needs exactly 5 special abilities.');
  if (v.magazineEditorials.length < 3 || v.magazineEditorials.length > 4) errs.push('The magazine cover needs 3 or 4 “inside this edition” lines.');
  FIELDS.forEach((g) =>
    g.items.forEach((it) => {
      const val = v[it.key];
      if (!val || (Array.isArray(val) && !val.length)) errs.push(`“${it.label.split(' (')[0]}” can't be empty.`);
    }),
  );
  return errs;
}

export default function AdminEditor({ student }) {
  const roll = student.rollNumber;
  const [form, setForm] = useState(() => toForm(student));
  const [saved, setSaved] = useState('');
  const [errors, setErrors] = useState([]);

  const base = useMemo(() => BASE_STUDENTS.find((b) => b.rollNumber === roll), [roll]);
  const parsed = useMemo(() => fromForm(form), [form]);
  const warnEnd = !parsed.encouragementLetter.endsWith(REQUIRED_END);

  const set = (key, val) => {
    setSaved('');
    setForm((f) => ({ ...f, [key]: val }));
  };

  const toggle = (id) => {
    setSaved('');
    setForm((f) => ({ ...f, strengths: f.strengths.includes(id) ? f.strengths.filter((x) => x !== id) : [...f.strengths, id] }));
  };

  const save = (e) => {
    e.preventDefault();
    const errs = validate(parsed);
    setErrors(errs);
    if (errs.length) return;
    // Only store the fields that differ from the built-in content (plus anything in overrides.json).
    const reference = { ...base, ...(FILE_OVERRIDES[roll] || {}) };
    const patch = {};
    Object.keys(parsed).forEach((k) => {
      if (JSON.stringify(parsed[k]) !== JSON.stringify(reference[k])) patch[k] = parsed[k];
    });
    setOverride(roll, patch);
    setSaved('Saved. Open “Preview” to see it exactly as the student will.');
  };

  const reset = () => {
    if (!window.confirm(`Undo all edits made on this device for ${student.name}?`)) return;
    resetOverride(roll);
    const original = { ...base, ...(FILE_OVERRIDES[roll] || {}) };
    setForm(toForm(original));
    setErrors([]);
    setSaved('Back to the original content.');
  };

  return (
    <div className="admin">
      <AdminBar current="dashboard" />
      <main className="container admin-main">
        <p>
          <Link to="/admin/dashboard" className="back-link">
            <LuArrowLeft aria-hidden="true" /> All students
          </Link>
        </p>
        <h1 className="admin-title">{student.name}</h1>
        <p className="muted">
          Roll No. {roll} · PIN {student.pin} · Class 8B. The name and PIN are fixed; everything below can be changed.
        </p>

        <form onSubmit={save} className="editor" noValidate>
          <fieldset className="editor-group">
            <legend>Section 03 · Superpowers ({form.strengths.length} chosen — pick 4 to 6)</legend>
            <div className="chips">
              {STRENGTH_IDS.map((id) => (
                <label key={id} className={`chip${form.strengths.includes(id) ? ' is-on' : ''}`}>
                  <input type="checkbox" checked={form.strengths.includes(id)} onChange={() => toggle(id)} />
                  <span>{STRENGTHS[id].title}</span>
                </label>
              ))}
            </div>
          </fieldset>

          {FIELDS.map((g) => (
            <fieldset key={g.group} className="editor-group">
              <legend>{g.group}</legend>
              {g.items.map((it) => (
                <label key={it.key} className="field">
                  <span className="field-label">{it.label}</span>
                  {it.kind === 'line' ? (
                    <input className="input" value={form[it.key]} onChange={(e) => set(it.key, e.target.value)} />
                  ) : (
                    <textarea className="input" rows={it.rows || 4} value={form[it.key]} onChange={(e) => set(it.key, e.target.value)} />
                  )}
                </label>
              ))}
            </fieldset>
          ))}

          {warnEnd && (
            <p className="admin-msg" role="status">
              Tip: the encouragement letter usually ends with “{REQUIRED_END}”
            </p>
          )}
          {errors.length > 0 && (
            <ul className="admin-errors" role="alert">
              {errors.map((er) => (
                <li key={er}>{er}</li>
              ))}
            </ul>
          )}
          {saved && (
            <p className="admin-ok" role="status">
              {saved}
            </p>
          )}

          <div className="editor-actions">
            <button type="submit" className="btn btn-primary">
              <LuSave aria-hidden="true" /> Save changes
            </button>
            <Link to={`/admin/preview/${roll}`} className="btn btn-ghost">
              <LuEye aria-hidden="true" /> Preview page
            </Link>
            {hasLocalEdits(roll) && (
              <button type="button" className="btn btn-ghost" onClick={reset}>
                <LuRotateCcw aria-hidden="true" /> Undo my edits
              </button>
            )}
          </div>
        </form>
      </main>
    </div>
  );
}
