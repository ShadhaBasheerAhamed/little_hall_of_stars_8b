import { STRENGTHS } from '../../data/catalog.js';
import { STRENGTH_ICONS } from '../common/icons.js';
import Constellation from './Constellation.jsx';

// Section 03 — superpower cards (no ranking, no comparison) plus the student's own constellation.
export default function Superpowers({ student }) {
  return (
    <>
      <p className="lead center">These are some of the qualities that shine in you.</p>
      <ul className="power-grid">
        {student.strengths.map((id, i) => {
          const s = STRENGTHS[id];
          if (!s) return null;
          const Icon = STRENGTH_ICONS[id];
          const line = s.lines[(student.rollNumber + i) % s.lines.length];
          return (
            <li key={id} className="power-card" style={{ '--tilt': `${i % 2 ? 0.6 : -0.6}deg` }}>
              <span className="power-icon" aria-hidden="true">
                {Icon ? <Icon /> : null}
              </span>
              <h2 className="power-title">{s.title}</h2>
              <p className="power-line">{line}</p>
            </li>
          );
        })}
      </ul>
      <Constellation student={student} />
    </>
  );
}
