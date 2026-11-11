#!/usr/bin/env node
// Generate QR codes for all 29 students
// Outputs: public/qr/ folder with PNGs, qr-codes.zip, qr-codes.pdf

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createCanvas } from 'canvas';
import JSZip from 'jszip';
import { PDFDocument, rgb } from 'pdf-lib';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const PUBLIC_DIR = path.join(ROOT, 'public');
const QR_DIR = path.join(PUBLIC_DIR, 'qr');
const DIST_DIR = path.join(ROOT, 'dist');
const DIST_QR_DIR = path.join(DIST_DIR, 'qr');

// Student roster
const ROSTER = [
  { roll: 823, name: 'Aarya' },
  { roll: 824, name: 'Amanda Pauline Raj' },
  { roll: 825, name: 'Annlin Delshia' },
  { roll: 826, name: 'Ashlin Danshia' },
  { roll: 827, name: 'Aswin Raj' },
  { roll: 828, name: 'Deivamithra' },
  { roll: 829, name: 'Dharshan' },
  { roll: 830, name: 'Fharoy Gabriel' },
  { roll: 831, name: 'Gautham Karthick' },
  { roll: 832, name: 'Kairav' },
  { roll: 833, name: 'Keshna' },
  { roll: 834, name: 'Mahalingam' },
  { roll: 835, name: 'Mahitha' },
  { roll: 836, name: 'Mukul' },
  { roll: 837, name: 'Nehashmitra' },
  { roll: 838, name: 'Niralya' },
  { roll: 839, name: 'Nivyanth' },
  { roll: 840, name: 'Rahul Antony' },
  { roll: 841, name: 'Ram Virath' },
  { roll: 842, name: 'Rohit Manas' },
  { roll: 843, name: 'Roshannah' },
  { roll: 844, name: 'Rositha' },
  { roll: 845, name: 'Sai Ashwinth' },
  { roll: 846, name: 'Sarvesh' },
  { roll: 847, name: 'Selva Sidhhanya' },
  { roll: 848, name: 'Sri Sharini Selvan' },
  { roll: 849, name: 'Suriya Dharshini' },
  { roll: 850, name: 'Tarun Sanjiv' },
  { roll: 851, name: 'Varshini' },
];

const LIVE_SITE_URL = 'https://littlehallofstarsmy8b.netlify.app/';

// QR Code generation (ported from src/utils/qr.js)
const ECC_PER_BLOCK = [-1, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26];
const NUM_BLOCKS = [-1, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5];
const MAX_VERSION = 10;

function rawModules(ver) {
  let r = (16 * ver + 128) * ver + 64;
  if (ver >= 2) {
    const na = Math.floor(ver / 7) + 2;
    r -= (25 * na - 10) * na - 55;
    if (ver >= 7) r -= 36;
  }
  return r;
}

function dataCodewords(ver) {
  return Math.floor(rawModules(ver) / 8) - ECC_PER_BLOCK[ver] * NUM_BLOCKS[ver];
}

function gfMul(x, y) {
  let z = 0;
  for (let i = 7; i >= 0; i--) {
    z = (z << 1) ^ ((z >>> 7) * 0x11d);
    z ^= ((y >>> i) & 1) * x;
  }
  return z;
}

function rsDivisor(degree) {
  const r = new Array(degree).fill(0);
  r[degree - 1] = 1;
  let root = 1;
  for (let i = 0; i < degree; i++) {
    for (let j = 0; j < r.length; j++) {
      r[j] = gfMul(r[j], root);
      if (j + 1 < r.length) r[j] ^= r[j + 1];
    }
    root = gfMul(root, 2);
  }
  return r;
}

function rsRemainder(data, div) {
  const r = new Array(div.length).fill(0);
  for (const b of data) {
    const f = b ^ r.shift();
    r.push(0);
    div.forEach((c, i) => {
      r[i] ^= gfMul(c, f);
    });
  }
  return r;
}

function addEccAndInterleave(data, ver) {
  const nb = NUM_BLOCKS[ver];
  const eccLen = ECC_PER_BLOCK[ver];
  const raw = Math.floor(rawModules(ver) / 8);
  const numShort = nb - (raw % nb);
  const shortLen = Math.floor(raw / nb);
  const div = rsDivisor(eccLen);
  const blocks = [];
  let k = 0;
  for (let i = 0; i < nb; i++) {
    const dat = data.slice(k, k + shortLen - eccLen + (i < numShort ? 0 : 1));
    k += dat.length;
    const ecc = rsRemainder(dat, div);
    if (i < numShort) dat.push(0);
    blocks.push(dat.concat(ecc));
  }
  const out = [];
  for (let i = 0; i < blocks[0].length; i++) {
    blocks.forEach((blk, j) => {
      if (i !== shortLen - eccLen || j >= numShort) out.push(blk[i]);
    });
  }
  return out;
}

function alignPositions(ver) {
  if (ver === 1) return [];
  const n = Math.floor(ver / 7) + 2;
  const size = ver * 4 + 17;
  const step = Math.ceil((ver * 4 + 4) / (n * 2 - 2)) * 2;
  const res = [6];
  for (let pos = size - 7; res.length < n; pos -= step) res.splice(1, 0, pos);
  return res;
}

function penalty(m) {
  const n = m.length;
  let score = 0;
  const lines = [];
  for (let i = 0; i < n; i++) {
    lines.push(m[i]);
    lines.push(m.map((r) => r[i]));
  }
  for (const line of lines) {
    let run = 1;
    for (let i = 1; i < n; i++) {
      if (line[i] === line[i - 1]) {
        run++;
        if (run === 5) score += 3;
        else if (run > 5) score++;
      } else run = 1;
    }
    for (let i = 0; i + 11 <= n; i++) {
      const s = line.slice(i, i + 11).map((v) => (v ? 1 : 0)).join('');
      if (s === '10111010000' || s === '00001011101') score += 40;
    }
  }
  for (let y = 0; y < n - 1; y++) {
    for (let x = 0; x < n - 1; x++) {
      const v = m[y][x];
      if (v === m[y][x + 1] && v === m[y + 1][x] && v === m[y + 1][x + 1]) score += 3;
    }
  }
  let dark = 0;
  m.forEach((r) => r.forEach((v) => { if (v) dark++; }));
  score += Math.floor(Math.abs((dark * 100) / (n * n) - 50) / 5) * 10;
  return score;
}

function buildMatrix(codewords, ver) {
  const size = ver * 4 + 17;
  const mods = Array.from({ length: size }, () => new Array(size).fill(false));
  const isFn = Array.from({ length: size }, () => new Array(size).fill(false));
  const setFn = (x, y, dark) => {
    mods[y][x] = dark;
    isFn[y][x] = true;
  };

  for (let i = 0; i < size; i++) {
    setFn(6, i, i % 2 === 0);
    setFn(i, 6, i % 2 === 0);
  }
  const finder = (cx, cy) => {
    for (let dy = -4; dy <= 4; dy++) {
      for (let dx = -4; dx <= 4; dx++) {
        const d = Math.max(Math.abs(dx), Math.abs(dy));
        const x = cx + dx;
        const y = cy + dy;
        if (x >= 0 && x < size && y >= 0 && y < size) setFn(x, y, d !== 2 && d !== 4);
      }
    }
  };
  finder(3, 3);
  finder(size - 4, 3);
  finder(3, size - 4);
  const pos = alignPositions(ver);
  const na = pos.length;
  for (let i = 0; i < na; i++) {
    for (let j = 0; j < na; j++) {
      if ((i === 0 && j === 0) || (i === 0 && j === na - 1) || (i === na - 1 && j === 0)) continue;
      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) setFn(pos[i] + dx, pos[j] + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
      }
    }
  }

  const drawFormat = (put, mask) => {
    const data = (0 << 3) | mask;
    let rem = data;
    for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
    const bits = ((data << 10) | rem) ^ 0x5412;
    const bit = (i) => ((bits >>> i) & 1) !== 0;
    for (let i = 0; i <= 5; i++) put(8, i, bit(i));
    put(8, 7, bit(6));
    put(8, 8, bit(7));
    put(7, 8, bit(8));
    for (let i = 9; i < 15; i++) put(14 - i, 8, bit(i));
    for (let i = 0; i < 8; i++) put(size - 1 - i, 8, bit(i));
    for (let i = 8; i < 15; i++) put(8, size - 15 + i, bit(i));
    put(8, size - 8, true);
  };
  const drawFormatFixed = drawFormat;
  drawFormatFixed(setFn, 0);

  if (ver >= 7) {
    let rem = ver;
    for (let i = 0; i < 12; i++) rem = (rem << 1) ^ ((rem >>> 11) * 0x1f25);
    const bits = (ver << 12) | rem;
    for (let i = 0; i < 18; i++) {
      const c = ((bits >>> i) & 1) !== 0;
      const a = size - 11 + (i % 3);
      const b = Math.floor(i / 3);
      setFn(a, b, c);
      setFn(b, a, c);
    }
  }

  let bi = 0;
  const total = codewords.length * 8;
  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5;
    for (let vert = 0; vert < size; vert++) {
      for (let j = 0; j < 2; j++) {
        const x = right - j;
        const upward = ((right + 1) & 2) === 0;
        const y = upward ? size - 1 - vert : vert;
        if (!isFn[y][x] && bi < total) {
          mods[y][x] = ((codewords[bi >>> 3] >>> (7 - (bi & 7))) & 1) !== 0;
          bi++;
        }
      }
    }
  }

  const masked = (mask) => {
    const copy = mods.map((r) => r.slice());
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        let inv;
        switch (mask) {
          case 0: inv = (x + y) % 2 === 0; break;
          case 1: inv = y % 2 === 0; break;
          case 2: inv = x % 3 === 0; break;
          case 3: inv = (x + y) % 3 === 0; break;
          case 4: inv = (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0; break;
          case 5: inv = ((x * y) % 2) + ((x * y) % 3) === 0; break;
          case 6: inv = ((((x * y) % 2) + ((x * y) % 3)) % 2) === 0; break;
          default: inv = ((((x + y) % 2) + ((x * y) % 3)) % 2) === 0; break;
        }
        if (!isFn[y][x] && inv) copy[y][x] = !copy[y][x];
      }
    }
    drawFormatFixed((x, y, v) => { copy[y][x] = v; }, mask);
    return copy;
  };

  let best = null;
  let bestScore = Infinity;
  for (let mask = 0; mask < 8; mask++) {
    const m = masked(mask);
    const s = penalty(m);
    if (s < bestScore) {
      bestScore = s;
      best = m;
    }
  }
  return best;
}

function encodeQR(text) {
  const bytes = Array.from(new TextEncoder().encode(text));
  let ver = 1;
  for (; ; ver++) {
    if (ver > MAX_VERSION) throw new Error('That web address is too long for a QR code. Please use a shorter one.');
    const ccBits = ver <= 9 ? 8 : 16;
    if (4 + ccBits + bytes.length * 8 <= dataCodewords(ver) * 8) break;
  }
  const ccBits = ver <= 9 ? 8 : 16;
  const bits = [];
  const put = (val, len) => {
    for (let i = len - 1; i >= 0; i--) bits.push((val >>> i) & 1);
  };
  put(0b0100, 4);
  put(bytes.length, ccBits);
  bytes.forEach((b) => put(b, 8));
  const cap = dataCodewords(ver) * 8;
  put(0, Math.min(4, cap - bits.length));
  put(0, (8 - (bits.length % 8)) % 8);
  for (let pad = 0xec; bits.length < cap; pad ^= 0xec ^ 0x11) put(pad, 8);
  const data = [];
  for (let i = 0; i < bits.length; i += 8) {
    let b = 0;
    for (let j = 0; j < 8; j++) b = (b << 1) | bits[i + j];
    data.push(b);
  }
  return buildMatrix(addEccAndInterleave(data, ver), ver);
}

function qrToSvgPath(m, quiet = 4) {
  let d = '';
  m.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      if (row[x]) {
        let x2 = x;
        while (x2 < row.length && row[x2]) x2++;
        d += `M${x + quiet},${y + quiet}h${x2 - x}v1h-${x2 - x}z`;
        x = x2;
      } else x++;
    }
  });
  return d;
}

function generateQRCode(text) {
  const m = encodeQR(text);
  const d = qrToSvgPath(m, 4);
  const size = m.length + 8;
  return { d, size, modules: m };
}

function slug(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

async function generateQRCodePNG(text, px = 1024) {
  const m = encodeQR(text);
  const size = m.length;
  
  // Create canvas
  const canvas = createCanvas(px, px);
  const ctx = canvas.getContext('2d');
  
  // Fill white background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, px, px);
  
  // Draw QR modules
  const moduleSize = px / (size + 8); // +8 for quiet zone
  ctx.fillStyle = '#14233d';
  
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (m[y][x]) {
        const drawX = (x + 4) * moduleSize;
        const drawY = (y + 4) * moduleSize;
        ctx.fillRect(drawX, drawY, moduleSize, moduleSize);
      }
    }
  }
  
  return canvas.toBuffer('image/png');
}

async function main() {
  console.log('Generating QR codes for 29 students...');
  
  // Ensure directories exist
  fs.mkdirSync(QR_DIR, { recursive: true });
  fs.mkdirSync(DIST_QR_DIR, { recursive: true });
  
  const zip = new JSZip();
  const pdfDoc = await PDFDocument.create();
  
  // A4 dimensions in points
  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const margin = 28;
  const cardWidth = 130;
  const cardHeight = 160;
  const gapX = 20;
  const gapY = 20;
  const cols = 3;
  const rows = 5;
  const maxPerPage = cols * rows;
  
  let page = pdfDoc.addPage([pageWidth, pageHeight]);
  let x = margin;
  let y = pageHeight - margin;
  
  for (let i = 0; i < ROSTER.length; i++) {
    const student = ROSTER[i];
    const link = `${LIVE_SITE_URL}#/?star=${student.roll}`;
    const filename = `qr-${String(student.roll).padStart(2, '0')}-${slug(student.name)}.png`;
    
    console.log(`Generating QR for ${student.name} (Roll ${student.roll})...`);
    
    const pngBuffer = await generateQRCodePNG(link, 1024);
    
    // Save to public/qr/
    fs.writeFileSync(path.join(QR_DIR, filename), pngBuffer);
    // Save to dist/qr/ for deployment
    fs.writeFileSync(path.join(DIST_QR_DIR, filename), pngBuffer);
    
    // Add to ZIP
    zip.file(filename, pngBuffer);
    
    // Add to PDF
    if (i > 0 && i % maxPerPage === 0) {
      page = pdfDoc.addPage([pageWidth, pageHeight]);
      x = margin;
      y = pageHeight - margin;
    }
    
    const pngImage = await pdfDoc.embedPng(pngBuffer);
    
    // Draw QR code
    page.drawImage(pngImage, {
      x,
      y: y - 80,
      width: 80,
      height: 80,
    });
    
    // Draw student name
    page.drawText(student.name, {
      x,
      y: y - 100,
      size: 10,
      color: rgb(0.15, 0.2, 0.3),
    });
    
    // Draw roll number
    page.drawText(`Roll No. ${student.roll}`, {
      x,
      y: y - 114,
      size: 9,
      color: rgb(0.3, 0.35, 0.45),
    });
    
    x += cardWidth + gapX;
    if ((i + 1) % cols === 0 && i < ROSTER.length - 1) {
      x = margin;
      y -= cardHeight + gapY;
    }
  }
  
  // Save ZIP
  const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });
  fs.writeFileSync(path.join(PUBLIC_DIR, 'qr-codes.zip'), zipBuffer);
  fs.writeFileSync(path.join(DIST_DIR, 'qr-codes.zip'), zipBuffer);
  
  // Save PDF
  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(path.join(PUBLIC_DIR, 'qr-codes.pdf'), pdfBytes);
  fs.writeFileSync(path.join(DIST_DIR, 'qr-codes.pdf'), pdfBytes);
  
  console.log(`\n✅ Generated ${ROSTER.length} QR codes`);
  console.log(`📁 PNGs saved to: ${QR_DIR}`);
  console.log(`📦 ZIP saved to: ${path.join(PUBLIC_DIR, 'qr-codes.zip')}`);
  console.log(`📄 PDF saved to: ${path.join(PUBLIC_DIR, 'qr-codes.pdf')}`);
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});