import Sparkle from '../common/Sparkle.jsx';
import { pad2 } from '../../utils/rng.js';
import { CLASS_SIZE } from '../../config.js';

// Section 01 — a polaroid-style identity card (typographic monogram instead of a photograph).
export default function LittleWorld({ student }) {
  const initial = student.name.trim().charAt(0).toUpperCase();
  return (
    <>
      <div className="idcard paper">
        <figure className="polaroid">
          <span className="tape" aria-hidden="true" />
          <div className="polaroid-img" aria-hidden="true">
            <span className="monogram">{initial}</span>
            <Sparkle className="p-star p-star-a" />
            <Sparkle className="p-star p-star-b" />
          </div>
          <figcaption className="polaroid-cap hand">{student.name}</figcaption>
        </figure>
        <div className="idcard-body">
          <p className="eyebrow">Little identity card</p>
          <h2 className="idcard-name">{student.name}</h2>
          <dl className="idcard-meta">
            <div>
              <dt>Class</dt>
              <dd>8B</dd>
            </div>
            <div>
              <dt>Roll No.</dt>
              <dd>{student.rollNumber}</dd>
            </div>
            <div>
              <dt>Star no.</dt>
              <dd>
                {pad2(student.rollNumber)} / {CLASS_SIZE}
              </dd>
            </div>
          </dl>
        </div>
      </div>
      <p className="lead">{student.introduction}</p>
      <blockquote className="quote">
        <Sparkle className="quote-star" />
        <p>{student.quote}</p>
      </blockquote>
    </>
  );
}
