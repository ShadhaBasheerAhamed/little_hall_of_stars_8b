import { forwardRef, useMemo } from 'react';
import { encodeQR, qrToSvgPath } from '../../utils/qr.js';

// Crisp, scalable QR code drawn as one SVG path. Includes the 4-module quiet zone scanners need.
const QRCode = forwardRef(function QRCode({ value, className = '', label }, ref) {
  const { d, size } = useMemo(() => {
    const m = encodeQR(value);
    return { d: qrToSvgPath(m, 4), size: m.length + 8 };
  }, [value]);
  return (
    <svg ref={ref} className={className} viewBox={`0 0 ${size} ${size}`} xmlns="http://www.w3.org/2000/svg" shapeRendering="crispEdges" role="img" aria-label={label || 'QR code'}>
      <rect width={size} height={size} fill="#ffffff" />
      <path d={d} fill="#14233d" />
    </svg>
  );
});

export default QRCode;
