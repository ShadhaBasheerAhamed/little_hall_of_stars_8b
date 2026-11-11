export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export function downloadText(text, filename, type = 'application/json') {
  downloadBlob(new Blob([text], { type }), filename);
}

export function svgToPngBlob(svgEl, px = 1024) {
  return new Promise((resolve, reject) => {
    const xml = new XMLSerializer().serializeToString(svgEl);
    const src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(xml);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = px;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, px, px);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, 0, 0, px, px);
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Could not create PNG'))), 'image/png');
    };
    img.onerror = () => reject(new Error('Could not render QR image'));
    img.src = src;
  });
}

export async function generateQRCodeBlob(value, px = 1024) {
  const { encodeQR, qrToSvgPath } = await import('./qr.js');
  const m = encodeQR(value);
  const d = qrToSvgPath(m, 4);
  const size = m.length + 8;
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 ' + size + ' ' + size);
  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  svg.setAttribute('shape-rendering', 'crispEdges');
  svg.innerHTML = '<rect width="' + size + '" height="' + size + '" fill="#ffffff"/><path d="' + d + '" fill="#14233d"/>';
  return svgToPngBlob(svg, px);
}

export async function generateAllQRCodeBlobs(students, siteUrl, px = 1024) {
  const clean = siteUrl.trim().split('#')[0];
  const blobs = [];
  for (const s of students) {
    const link = clean + '#/?star=' + s.rollNumber;
    const blob = await generateQRCodeBlob(link, px);
    blobs.push({ student: s, blob });
  }
  return blobs;
}

export function slug(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}