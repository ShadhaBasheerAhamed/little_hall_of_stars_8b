import { useMemo } from 'react';
import { mulberry32 } from '../../utils/rng.js';
import { STRENGTHS } from '../../data/catalog.js';
import { SPARKLE_PATH } from '../common/Sparkle.jsx';

// A symbolic constellation: one star per superpower, placed in a stable pattern unique to each student.
export default function Constellation({ student }) {
  const titles = student.strengths.map((id) => (STRENGTHS[id] ? STRENGTHS[id].title : id));
  const points = useMemo(() => {
    const r = mulberry32(student.rollNumber * 97 + 11);
    const n = student.strengths.length;
    const out = [];
    let tries = 0;
    while (out.length < n && tries < 800) {
      tries++;
      const p = { x: 34 + r() * 232, y: 28 + r() * 124 };
      if (out.every((q) => Math.hypot(q.x - p.x, q.y - p.y) > 50)) out.push(p);
    }
    while (out.length < n) out.push({ x: 34 + r() * 232, y: 28 + r() * 124 });
    return out.sort((a, b) => a.x - b.x);
  }, [student.rollNumber, student.strengths.length]);

  const dust = useMemo(() => {
    const r = mulberry32(student.rollNumber * 41 + 2);
    return Array.from({ length: 22 }, () => ({ x: r() * 300, y: r() * 180, r: 0.6 + r() * 1.1 }));
  }, [student.rollNumber]);

  return (
    <figure className="constellation paper">
      <figcaption className="constellation-cap">
        <span className="eyebrow">Your own constellation</span>
        <span className="constellation-sub">One star for each of your superpowers — together they make a pattern no one else has.</span>
      </figcaption>
      <svg viewBox="0 0 300 180" role="img" aria-label={`Constellation with ${titles.length} stars: ${titles.join(', ')}`}>
        <rect width="300" height="180" rx="14" className="const-sky" />
        {dust.map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y} r={d.r} className="const-dust" />
        ))}
        <polyline className="const-line" points={points.map((p) => `${p.x},${p.y}`).join(' ')} fill="none" />
        {points.map((p, i) => (
          <g key={i} transform={`translate(${p.x - 11} ${p.y - 11}) scale(${22 / 24})`}>
            <path d={SPARKLE_PATH} className="const-star" />
          </g>
        ))}
        {points.map((p, i) => (
          <text key={`t${i}`} x={p.x} y={p.y + 25} textAnchor="middle" className="const-num">
            {i + 1}
          </text>
        ))}
      </svg>
      <ol className="const-legend">
        {titles.map((t, i) => (
          <li key={i}>{t}</li>
        ))}
      </ol>
    </figure>
  );
}
