// A calm still-life of the bouquet, used while the 3D viewer loads and if it ever can't.
function Rose({ x, y, r, c1, c2, c3 }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill={c1} />
      <circle cx={x} cy={y} r={r * 0.78} fill={c2} />
      <path d={`M${x - r * 0.62} ${y + r * 0.08} Q${x} ${y - r * 0.8} ${x + r * 0.62} ${y + r * 0.08}`} fill="none" stroke={c3} strokeWidth={r * 0.09} strokeLinecap="round" />
      <path d={`M${x - r * 0.45} ${y + r * 0.42} Q${x + r * 0.05} ${y - r * 0.15} ${x + r * 0.52} ${y + r * 0.42}`} fill="none" stroke={c3} strokeWidth={r * 0.09} strokeLinecap="round" />
      <path d={`M${x - r * 0.22} ${y + r * 0.05} q${r * 0.22} ${-r * 0.32} ${r * 0.44} 0 q${-r * 0.1} ${r * 0.28} ${-r * 0.32} ${r * 0.12}z`} fill={c3} />
    </g>
  );
}

export default function BouquetFallback({ small = false }) {
  return (
    <svg className={`bouquet-still${small ? ' is-small' : ''}`} viewBox="0 0 200 220" role="img" aria-label="A bouquet of red, pink and white roses">
      <path d="M100 110 L50 150 L100 215 L150 150 Z" fill="#f1c4c9" />
      <path d="M100 110 L62 150 L100 205 L138 150 Z" fill="#fbeee3" opacity="0.7" />
      <path d="M67 160 Q100 172 133 160 L128 178 Q100 190 72 178 Z" fill="#a8222f" />
      <g stroke="#2f6b2f" strokeWidth="3" fill="none"><path d="M100 120 L100 75" /><path d="M100 125 L60 85" /><path d="M100 125 L140 85" /></g>
      <ellipse cx="62" cy="118" rx="22" ry="8" fill="#3f8a3f" transform="rotate(-25 62 118)" />
      <ellipse cx="140" cy="118" rx="22" ry="8" fill="#3f8a3f" transform="rotate(25 140 118)" />
      <Rose x={100} y={62} r={26} c1="#b3192b" c2="#cf2a3d" c3="#7d0f1d" />
      <Rose x={58} y={88} r={22} c1="#f4b6c4" c2="#f9cfd9" c3="#d98098" />
      <Rose x={142} y={88} r={22} c1="#fdfaf3" c2="#f3ebdb" c3="#cdbf9f" />
      <Rose x={100} y={104} r={20} c1="#f4b6c4" c2="#f9cfd9" c3="#d98098" />
      {[[34, 70], [166, 70], [84, 30], [120, 28], [28, 104], [174, 104]].map(([x, y]) => (
        <circle key={x + '-' + y} cx={x} cy={y} r="3.2" fill="#fff" />
      ))}
    </svg>
  );
}
