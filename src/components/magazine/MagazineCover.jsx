import Sparkle from '../common/Sparkle.jsx';
import { pad2 } from '../../utils/rng.js';
import { SEALED_ON } from '../../config.js';

// Section 05 — typographic magazine cover (no photograph needed).
export default function MagazineCover({ student }) {
  // Size the name by its longest word so it always fits the cover (container units: 1cqi = 1% of cover width).
  const longest = Math.max(...student.name.trim().split(/\s+/).map((w) => w.length));
  const fontSize = `${Math.max(7, Math.min(17, 82 / (longest * 0.86))).toFixed(1)}cqi`;
  return (
    <>
      <figure className="mag" aria-label={`Magazine cover for ${student.name}`}>
        <Sparkle className="mag-deco mag-deco-a" />
        <Sparkle className="mag-deco mag-deco-b" />
        <Sparkle className="mag-deco mag-deco-c" />
        <p className="mag-masthead">The Little Hall of Stars</p>
        <p className="mag-issue">
          Class 8B Edition · {SEALED_ON} · No. {pad2(student.rollNumber)}
        </p>
        <div className="mag-main">
          <h2 className="mag-name" style={{ fontSize }}>{student.name}</h2>
          <p className="mag-headline">“{student.magazineHeadline}”</p>
          <p className="mag-sub">{student.magazineSubtitle}</p>
        </div>
        <div className="mag-inside">
          <p className="mag-inside-title">Inside this edition</p>
          <ul>
            {student.magazineEditorials.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </div>
        <p className="mag-foot">{student.magazineDescription}</p>
      </figure>
      <p className="muted center cover-note">Every star gets a cover. This one is yours.</p>
    </>
  );
}
