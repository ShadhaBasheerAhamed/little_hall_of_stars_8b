import { useMemo } from 'react';
import { mulberry32 } from '../../utils/rng.js';
import Sparkle from './Sparkle.jsx';

// Decorative twinkling background. Purely visual (aria-hidden); motion is disabled by prefers-reduced-motion in CSS.
export default function Starfield({ count = 28, seed = 7, color = 'var(--gold)' }) {
  const stars = useMemo(() => {
    const r = mulberry32(seed);
    return Array.from({ length: count }, () => ({
      x: r() * 100,
      y: r() * 100,
      s: 7 + r() * 14,
      d: r() * 5,
      t: 3 + r() * 4,
      o: 0.25 + r() * 0.5,
    }));
  }, [count, seed]);
  return (
    <div className="starfield" aria-hidden="true">
      {stars.map((s, i) => (
        <Sparkle
          key={i}
          className="sf-star"
          style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.s, height: s.s, opacity: s.o, animationDelay: `${s.d}s`, animationDuration: `${s.t}s`, color }}
        />
      ))}
    </div>
  );
}
