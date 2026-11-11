import { useState } from 'react';
import { LuHourglass } from 'react-icons/lu';
import Sparkle from '../common/Sparkle.jsx';
import Starfield from '../common/Starfield.jsx';
import { SEALED_ON } from '../../config.js';

// "A Message to Open Years Later" — a sealed capsule that can be opened now or kept for later.
export default function TimeCapsule({ student }) {
  const [open, setOpen] = useState(false);
  const paras = student.timeCapsule.split('\n\n');
  return (
    <main className="capsule-page">
      <Starfield count={30} seed={student.rollNumber * 5 + 9} />
      <div className="container page-enter">
        <header className="section-head">
          <p className="section-num">A LITTLE EXTRA</p>
          <h1 className="section-title">A Message to Open Years Later</h1>
        </header>
        {!open ? (
          <div className="sealed">
            <div className="capsule" aria-hidden="true">
              <Sparkle className="capsule-star" />
            </div>
            <span className="capsule-band hand">sealed in Class 8B · {SEALED_ON}</span>
            <p className="lead center">Read it today if you like — or keep it closed and come back when you're all grown up.</p>
            <button type="button" className="btn btn-primary btn-lg" onClick={() => setOpen(true)}>
              <LuHourglass aria-hidden="true" /> Open the time capsule
            </button>
          </div>
        ) : (
          <>
            <article className="stationery page-enter" aria-label="Time capsule message">
              <span className="stationery-ribbon" aria-hidden="true" />
              {paras.map((p, i) => (
                <p key={i} className="letter-p hand">
                  {p}
                </p>
              ))}
              <p className="letter-p hand letter-sign">— Your Shadha Mam ❤️</p>
            </article>
            <p className="center">
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setOpen(false)}>
                Seal it again
              </button>
            </p>
          </>
        )}
      </div>
    </main>
  );
}
