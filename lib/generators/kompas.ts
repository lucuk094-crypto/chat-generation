import { createCanvas, loadImage } from '@napi-rs/canvas';
import { fetchBuffer, setupFont, getCachedFile } from '../utils-canvas';

const NEWS_BG_URL = 'https://raw.githubusercontent.com/ryyntwx/allimagerin/refs/heads/main/Fberita.png';
const FONT_URL = 'https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuFuYAZ9hiJ-Ek-_EeA.woff2';

const BG_W = 962;
const BG_H = 1634;

export interface KompasParams {
  newsText: string;
  photoSrc: string;
}

function wordWrap(text: string, ctx: any, maxWidth: number) {
  const words = text.split(' ');
  const lines = [];
  let current = '';
  for (let i = 0; i < words.length; i++) {
    const test = current + words[i] + ' ';
    if (ctx.measureText(test.trim()).width > maxWidth && i > 0) {
      lines.push(current.trim());
      current = words[i] + ' ';
    } else {
      current = test;
    }
  }
  if (current) lines.push(current.trim());
  return lines;
}

function roundedClipPath(ctx: any, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

export async function generateKompas(params: KompasParams): Promise<Buffer> {
  const { newsText, photoSrc } = params;
  
  await setupFont('Inter-Bold.ttf', FONT_URL, 'InterNews');
  const bgPath = await getCachedFile('berita.png', NEWS_BG_URL);

  const canvas = createCanvas(BG_W, BG_H);
  const ctx = canvas.getContext('2d');
  const bgImg = await loadImage(bgPath);
  ctx.drawImage(bgImg, 0, 0, BG_W, BG_H);

  // Load Photo
  const photoBuf = await fetchBuffer(photoSrc);
  const photoImg = await loadImage(photoBuf);

  const zone = { a: 1025, b: 1634, c: 0, d: 962, radius: 0 };
  const w = zone.d - zone.c;
  const h = zone.b - zone.a;
  
  ctx.save();
  roundedClipPath(ctx, zone.c, zone.a, w, h, zone.radius);
  ctx.clip();
  ctx.filter = 'blur(28px)';
  ctx.drawImage(photoImg, zone.c - 40, zone.a - 40, w + 80, h + 80);
  ctx.filter = 'none';

  const imgRatio = photoImg.width / photoImg.height;
  const boxRatio = w / h;
  let fw, fh;
  if (imgRatio > boxRatio) {
    fw = w;
    fh = fw / imgRatio;
  } else {
    fh = h;
    fw = fh * imgRatio;
  }

  ctx.drawImage(photoImg, zone.c + (w - fw) / 2, zone.a + (h - fh) / 2, fw, fh);
  ctx.restore();

  const text = newsText.replace(/\s+/g, ' ').trim();
  const textCfg = { x: 30, y: 277, maxWidth: 1010 };
  
  const words = text.split(' ');
  const fontSize = words.length <= 18 ? 76 : 56;
  const lineGap = words.length <= 18 ? 12 : 18;
  const lineHeight = fontSize + lineGap;

  ctx.font = `700 ${fontSize}px InterNews`;
  ctx.fillStyle = '#eaf2f8';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  let lines = wordWrap(text, ctx, textCfg.maxWidth);
  if (lines.length > 6) {
    lines = lines.slice(0, 5);
    lines.push('...');
  }

  ctx.save();
  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], textCfg.x, textCfg.y + i * lineHeight);
  }
  ctx.restore();

  return await canvas.encode('png');
}
