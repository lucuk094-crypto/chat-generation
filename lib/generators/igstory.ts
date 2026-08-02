import { createCanvas, loadImage, Image } from '@napi-rs/canvas';
import { fetchBuffer, setupFont, getCachedFile } from '../utils-canvas';

const IGIMG_BG_URL = 'https://raw.githubusercontent.com/Ditzzx-vibecoder/Assets/main/Image/igimg.png';
const FONT_SEMIBOLD_URL = 'https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuGKYAZ9hiJ-Ek-_EeA.woff2';
const FONT_REGULAR_URL = 'https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2';

const BG_W = 898;
const BG_H = 1600;

export interface IgStoryParams {
  photoSrc: string;
  ppSrc: string;
  nama: string;
  username: string;
  theme?: 'light' | 'dark';
}

function roundedBottomClipPath(ctx: any, x: number, y: number, w: number, h: number, r: number) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + w, y);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y);
  ctx.closePath();
}

function roundedBottomOuterPath(ctx: any, x: number, y: number, w: number, h: number, r: number, bw: number) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.rect(x - bw, y, bw, h - radius);
  ctx.rect(x + w, y, bw, h - radius);
  ctx.moveTo(x - bw, y + h - radius);
  ctx.lineTo(x, y + h - radius);
  ctx.quadraticCurveTo(x, y + h, x + radius, y + h);
  ctx.lineTo(x + radius, y + h + bw);
  ctx.quadraticCurveTo(x - bw, y + h + bw, x - bw, y + h - radius);
  ctx.closePath();
  ctx.moveTo(x + w + bw, y + h - radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + w - radius, y + h + bw);
  ctx.quadraticCurveTo(x + w + bw, y + h + bw, x + w + bw, y + h - radius);
  ctx.closePath();
  ctx.rect(x + radius, y + h, w - radius * 2, bw);
}

function getContainSize(img: Image, w: number, h: number) {
  const imgRatio = img.width / img.height;
  const boxRatio = w / h;
  let fw, fh;
  if (imgRatio > boxRatio) {
    fw = w;
    fh = fw / imgRatio;
  } else {
    fh = h;
    fw = fh * imgRatio;
  }
  return { fw, fh };
}

function getCoverSize(img: Image, w: number, h: number) {
  const imgRatio = img.width / img.height;
  const boxRatio = w / h;
  let fw, fh;
  if (imgRatio > boxRatio) {
    fh = h;
    fw = fh * imgRatio;
  } else {
    fw = w;
    fh = fw / imgRatio;
  }
  return { fw, fh };
}

function resolveFontSize(ctx: any, cfg: any, fontFamily: string) {
  const { text, maxWidth, fontSize, minFontSize = 10 } = cfg;
  if (!maxWidth) return fontSize;
  const words = text.split(' ');
  let size = fontSize;
  while (size > minFontSize) {
    ctx.font = `${size}px ${fontFamily}`;
    const totalWidth = ctx.measureText(text).width;
    if (totalWidth <= maxWidth) break;
    const slotPerWord = maxWidth / words.length;
    const overflow = words.some((w: string) => ctx.measureText(w).width > slotPerWord * 1.5);
    if (!overflow && totalWidth <= maxWidth) break;
    size -= 1;
  }
  return Math.max(size, minFontSize);
}

export async function generateIgStory(params: IgStoryParams): Promise<Buffer> {
  const { photoSrc, ppSrc, nama, username, theme = 'dark' } = params;

  await setupFont('Inter-SemiBold.woff2', FONT_SEMIBOLD_URL, 'InterSemiBold');
  await setupFont('Inter-Regular.woff2', FONT_REGULAR_URL, 'InterRegular');

  const bgLocal = await getCachedFile('igimg.png', IGIMG_BG_URL);
  const bgImg = await loadImage(bgLocal);

  const photoBuf = await fetchBuffer(photoSrc);
  const photoImg = await loadImage(photoBuf);

  const ppBuf = await fetchBuffer(ppSrc);
  const ppImg = await loadImage(ppBuf);

  const canvas = createCanvas(BG_W, BG_H);
  const ctx = canvas.getContext('2d');
  
  // Always draw template first
  ctx.drawImage(bgImg, 0, 0, BG_W, BG_H);
  
  // Apply light overlay if light mode (preserve photo area)
  if (theme === 'light') {
    ctx.save();
    // Light overlay on background only
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.fillRect(0, 0, BG_W, BG_H);
    ctx.restore();
  }

  // Theme colors
  const colors = theme === 'light'
    ? { name: '#000000', username: '#737373' }
    : { name: '#feffff', username: '#8c8d91' };

  const zone = { a: 136, b: 912, c: 38, d: 860, radius: 20 };
  
  // Draw Photo
  ctx.save();
  const w = zone.d - zone.c, h = zone.b - zone.a;
  roundedBottomClipPath(ctx, zone.c, zone.a, w, h, zone.radius);
  ctx.clip();
  ctx.filter = 'blur(28px)';
  ctx.drawImage(photoImg, zone.c - 40, zone.a - 40, w + 80, h + 80);
  ctx.filter = 'none';
  const { fw, fh } = getContainSize(photoImg, w, h);
  ctx.drawImage(photoImg, zone.c + (w - fw) / 2, zone.a + (h - fh) / 2, fw, fh);
  ctx.restore();

  // Draw Edge Blur
  const edgeBlur = { width: 3, blur: 10 };
  const coverSize = getCoverSize(photoImg, w, h);
  const imgX = zone.c + (w - coverSize.fw) / 2;
  const imgY = zone.a + (h - coverSize.fh) / 2;
  ctx.save();
  roundedBottomOuterPath(ctx, zone.c, zone.a, w, h, zone.radius, edgeBlur.width);
  ctx.clip();
  ctx.filter = `blur(${edgeBlur.blur}px)`;
  ctx.drawImage(photoImg, imgX, imgY, coverSize.fw, coverSize.fh);
  ctx.filter = 'none';
  ctx.restore();

  // Draw PP
  const pp = { x: 110, y: 82, size: 80 };
  const r = pp.size / 2;
  const dim = Math.min(ppImg.width, ppImg.height);
  const sx = (ppImg.width - dim) / 2;
  const sy = (ppImg.height - dim) / 2;
  ctx.save();
  ctx.beginPath();
  ctx.arc(pp.x, pp.y, r, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(ppImg, sx, sy, dim, dim, pp.x - r, pp.y - r, pp.size, pp.size);
  ctx.restore();

  // Draw Teks Nama
  const namaCfg = { x: 170, y: 58, fontSize: 25, maxWidth: 500, minFontSize: 16, text: nama || 'Someone' };
  ctx.save();
  const size = resolveFontSize(ctx, namaCfg, 'InterSemiBold');
  ctx.font = `${size}px InterSemiBold`;
  ctx.fillStyle = colors.name;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(namaCfg.text, namaCfg.x, namaCfg.y);
  ctx.restore();

  // Draw Teks Username
  const usernameCfg = { x: 170, y: 90, fontSize: 17, text: username || '@username' };
  ctx.save();
  ctx.font = `${usernameCfg.fontSize}px InterRegular`;
  ctx.fillStyle = colors.username;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(usernameCfg.text, usernameCfg.x, usernameCfg.y);
  ctx.restore();

  return await canvas.encode('png');
}
