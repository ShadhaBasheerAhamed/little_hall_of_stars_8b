import { useState } from 'react';
import { LuMailOpen } from 'react-icons/lu';
import Sparkle from '../common/Sparkle.jsx';

// Section 04 — a sealed letter that unfolds onto handwritten-style stationery.
export default function FutureLetter({ student }) {
  const [open, setOpen] = useState(false);
  const paras = student.letterToFutureSelf.split('\n\n');
  if (!open) {
    return (
      <div className="sealed">
        <div className="sealed-card" aria-hidden="true">
          <div className="wax">
            <Sparkle />
          </div>
          <p className="hand sealed-to">To: Future Me</p>
        </div>
        <p className="muted center">Written in Class 8B, to be read again someday.</p>
        <button type="button" className="btn btn-primary btn-lg" onClick={() => setOpen(true)}>
          <LuMailOpen aria-hidden="true" /> Read My Letter
        </button>
      </div>
    );
  }
  return (
    <>
      <article className="stationery page-enter" aria-label="Letter to my future self">
        <span className="stationery-ribbon" aria-hidden="true" />
        {paras.map((p, i) => (
          <p key={i} className={`letter-p hand${i === paras.length - 1 ? ' letter-sign' : ''}`}>
            {p}
          </p>
        ))}
      </article>
      <p className="center">
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setOpen(false)}>
          Fold the letter
        </button>
      </p>
    </>
  );
}
