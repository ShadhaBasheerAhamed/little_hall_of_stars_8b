import { useEffect, useState } from 'react';
import Starfield from '../common/Starfield.jsx';

// Section 07 — "Open when you doubt yourself": a closed envelope that opens with a gentle animation.
export default function Envelope({ student }) {
  const [open, setOpen] = useState(false);
  const [showLetter, setShowLetter] = useState(false);

  useEffect(() => {
    if (!open) {
      setShowLetter(false);
      return undefined;
    }
    const reduce = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const t = setTimeout(() => setShowLetter(true), reduce ? 0 : 800);
    return () => clearTimeout(t);
  }, [open]);

  const paras = student.encouragementLetter.split('\n\n');
  const closing = paras[paras.length - 1];
  const body = paras.slice(0, -1);

  return (
    <>
      <Starfield count={26} seed={student.rollNumber * 7 + 1} color="var(--gold-soft)" />
      <div className="env-wrap">
        <button type="button" className={`env${open ? ' is-open' : ''}`} aria-expanded={open} aria-controls="doubt-letter" onClick={() => setOpen((o) => !o)}>
          <span className="env-back" aria-hidden="true" />
          <span className="env-paper" aria-hidden="true" />
          <span className="env-flap" aria-hidden="true" />
          <span className="env-front" aria-hidden="true" />
          <span className="env-text hand">Open this when you feel you're not good enough.</span>
        </button>
        <p className="env-hint">{open ? 'Tap the envelope to close it again' : 'Tap the envelope to open it'}</p>
      </div>
      {showLetter && (
        <article id="doubt-letter" className="doubt-letter page-enter" aria-label="A letter for the harder days">
          {body.map((p, i) => (
            <p key={i} className="letter-p hand">
              {p}
            </p>
          ))}
          <p className="letter-p hand letter-closing">{closing}</p>
          <p className="letter-p hand letter-sign">— Your Shadha Mam ❤️</p>
        </article>
      )}
    </>
  );
}
