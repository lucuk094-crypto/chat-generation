import { GlobalFonts } from '@napi-rs/canvas';
import { writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import os from 'os';
import axios from 'axios';

const TMP_DIR = os.tmpdir();
const registeredFonts = new Set<string>();

export async function fetchBuffer(url: string): Promise<Buffer> {
  if (url.startsWith('data:')) {
    const base64Data = url.split(',')[1];
    return Buffer.from(base64Data, 'base64');
  }
  const client = axios.create({
    headers: { 'User-Agent': 'Mozilla/5.0' },
    maxRedirects: 5
  });
  const res = await client.get(url, { responseType: 'arraybuffer' });
  return Buffer.from(res.data);
}

export async function setupFont(fileName: string, url: string, family: string) {
  if (registeredFonts.has(fileName)) return;
  const dest = join(TMP_DIR, fileName);
  if (!existsSync(dest)) {
    const buf = await fetchBuffer(url);
    await writeFile(dest, buf);
  }
  GlobalFonts.registerFromPath(dest, family);
  registeredFonts.add(fileName);
}

export async function getCachedFile(fileName: string, url: string): Promise<string> {
  const dest = join(TMP_DIR, fileName);
  if (!existsSync(dest)) {
    const buf = await fetchBuffer(url);
    await writeFile(dest, buf);
  }
  return dest;
}

export function drawRoundedRect(ctx: any, x: number, y: number, w: number, h: number, r: number, fill: string, stroke: string | null = null, shadow = false) {
  ctx.save();
  if (shadow) {
    ctx.shadowColor = 'rgba(0,0,0,0.05)';
    ctx.shadowBlur = 40;
    ctx.shadowOffsetY = 12;
  }
  ctx.fillStyle = fill;
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
  ctx.fill();
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1; ctx.stroke(); }
  ctx.restore();
}

export function drawCircleImage(ctx: any, img: any, cx: number, cy: number, r: number) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(img, cx - r, cy - r, r * 2, r * 2);
  ctx.restore();
}
