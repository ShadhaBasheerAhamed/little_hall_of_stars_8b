import { forwardRef, useMemo } from 'react';
import { encodeQR, qrToSvgPath } from '../../utils/qr.js';
import { GIFT_YEAR } from '../../data/gifts.js';

// Card artwork is one SVG in millimetres (A6, 105 × 148) so it looks identical on screen,
// in print and when downloaded as a PNG. Fonts fall back gracefully inside the PNG.
export const CARD_W = 105;
export const CARD_H = 148;
const SERIF = "'Playfair Display', Georgia, 'Times New Roman', serif";
const HAND = "'Caveat', 'Segoe Script', 'Bradley Hand', cursive";

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

function Leaf({ x, y, rot, s = 1 }) {
  return <ellipse cx={x} cy={y} rx={6.5 * s} ry={2.6 * s} fill="#4a8a47" transform={`rotate(${rot} ${x} ${y})`} />;
}

const RED = ['#a8222f', '#c8323f', '#7a1220'];
const PINK = ['#f2b3c2', '#f8cdd8', '#d57f96'];
const WHITE = ['#fbf7ee', '#f1e8d6', '#cbbd9c'];

function Corner({ flip }) {
  // flip: 1 = top-left garland, -1 = bottom-right (rotated 180° by the caller)
  return (
    <g>
      <Leaf x={20} y={9} rot={-20} />
      <Leaf x={9} y={20} rot={70} />
      <Leaf x={26} y={15} rot={15} s={0.8} />
      <Rose x={9} y={9} r={7} c1={RED[0]} c2={RED[1]} c3={RED[2]} />
      <Rose x={21} y={6.5} r={4.6} c1={PINK[0]} c2={PINK[1]} c3={PINK[2]} />
      <Rose x={6.5} y={21} r={4.6} c1={WHITE[0]} c2={WHITE[1]} c3={WHITE[2]} />
      <circle cx={30} cy={7} r="1.1" fill="#fff" stroke="#e2d7c0" strokeWidth="0.2" />
      <circle cx={7} cy={30} r="1.1" fill="#fff" stroke="#e2d7c0" strokeWidth="0.2" />
    </g>
  );
}

const GreetingCard = forwardRef(function GreetingCard({ name, url, className = '' }, ref) {
  const qr = useMemo(() => {
    const m = encodeQR(url);
    return { d: qrToSvgPath(m, 4), size: m.length + 8 };
  }, [url]);
  const nameSize = Math.max(6.2, Math.min(11.5, 78 / (name.length * 0.6)));
  const QS = 44; // printed QR size in mm, quiet zone included
  const qx = (CARD_W - QS) / 2;
  const qy = 63;

  return (
    <svg ref={ref} className={className} viewBox={`0 0 ${CARD_W} ${CARD_H}`} xmlns="http://www.w3.org/2000/svg" role="img" aria-label={`Children's Day greeting card for ${name}`}>
      <rect width={CARD_W} height={CARD_H} fill="#fffaf0" />
      <rect x="3" y="3" width={CARD_W - 6} height={CARD_H - 6} rx="3" fill="none" stroke="#c79a3b" strokeWidth="0.5" />
      <rect x="4.6" y="4.6" width={CARD_W - 9.2} height={CARD_H - 9.2} rx="2.2" fill="none" stroke="#e6c878" strokeWidth="0.25" strokeDasharray="1 1" />
      <g transform="scale(0.78)">
        <Corner />
      </g>
      <g transform={`rotate(180 ${CARD_W / 2} ${CARD_H / 2})`}>
        <g transform="scale(0.78)">
          <Corner />
        </g>
      </g>

      <text x={CARD_W / 2} y="21" textAnchor="middle" fontFamily={SERIF} fontSize="2.6" letterSpacing="0.5" fill="#b98a2e" fontWeight="700" textLength="66" lengthAdjust="spacingAndGlyphs">
        THE LITTLE HALL OF STARS · CLASS 8B
      </text>
      <text x={CARD_W / 2} y="31" textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontWeight="700" fontSize="7" fill="#1b467f" textLength="76" lengthAdjust="spacingAndGlyphs">
        Happy Children's Day {GIFT_YEAR}!
      </text>
      <text x={CARD_W / 2} y="46" textAnchor="middle" fontFamily={HAND} fontSize={nameSize} fontWeight="700" fill="#b3192b">
        {name}
      </text>
      <line x1="32" y1="50.5" x2="73" y2="50.5" stroke="#e6c878" strokeWidth="0.35" />
      <path d={`M${CARD_W / 2} 53.6 l1 2 l2 .3 l-1.5 1.4 l.4 2 l-1.9 -1 l-1.9 1 l.4 -2 l-1.5 -1.4 l2 -.3z`} fill="#c79a3b" />

      <rect x={qx - 2} y={qy - 2} width={QS + 4} height={QS + 4} rx="3" fill="#fff" stroke="#e6c878" strokeWidth="0.35" />
      <g transform={`translate(${qx} ${qy}) scale(${QS / qr.size})`}>
        <rect width={qr.size} height={qr.size} fill="#fff" />
        <path d={qr.d} fill="#14233d" shapeRendering="crispEdges" />
      </g>

      <text x={CARD_W / 2} y="119" textAnchor="middle" fontFamily={HAND} fontSize="6" fontWeight="700" fill="#2b6cb0" textLength="72" lengthAdjust="spacingAndGlyphs">
        Scan to reveal your AR surprise!
      </text>
      <text x={CARD_W / 2} y="126" textAnchor="middle" fontFamily="Poppins, Arial, sans-serif" fontSize="2.3" fill="#55627b" textLength="62" lengthAdjust="spacingAndGlyphs">
        Open your phone camera and point it at the code
      </text>
      <text x={CARD_W / 2} y="136" textAnchor="middle" fontFamily={HAND} fontSize="5.4" fontWeight="700" fill="#23324a" textLength="52" lengthAdjust="spacingAndGlyphs">
        With love, Your Shadha Mam
      </text>
      <path d="M52.5 140.2 c-0.6 -1 -2.2 -1.4 -2.8 -0.2 c-0.7 1.3 1.2 2.5 2.8 3.8 c1.6 -1.3 3.5 -2.5 2.8 -3.8 c-0.6 -1.2 -2.2 -0.8 -2.8 0.2z" fill="#b3192b" />
    </svg>
  );
});

export default GreetingCard;
