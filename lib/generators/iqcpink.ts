import { createCanvas, loadImage, GlobalFonts } from '@napi-rs/canvas';
import { writeFile, readFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import axios from 'axios';

const BG_URL = "https://raw.githubusercontent.com/ryyntwx/allimagerin/refs/heads/main/Iqcbyrin.png";
const APPLE_EMOJI_JSON_URL = 'https://media.githubusercontent.com/media/Ditzzx-vibecoder/entahlah/main/emoji-apple.json';

const ASSETS_DIR = join(process.cwd(), 'assets', 'iqcpink');
const FONTS_DIR = join(ASSETS_DIR, 'fonts');
const BG_LOCAL = join(ASSETS_DIR, 'Iqcbyrin.png');
const APPLE_EMOJI_JSON_LOCAL = join(FONTS_DIR, 'emoji-apple-image.json');

const BG_W = 906;
const BG_H = 1736;
const SX = BG_W / 1080;
const SY = BG_H / 2280;

let appleEmojiMap: any = null;

async function downloadFile(url: string): Promise<Buffer> {
  const res = await axios.get(url, {
    responseType: 'arraybuffer',
    headers: { 'User-Agent': 'Mozilla/5.0' },
    maxRedirects: 5
  });
  return Buffer.from(res.data);
}

function emojiToUnicode(emoji: string): string {
  return [...emoji].map(c => c.codePointAt(0)?.toString(16)).join('-');
}

async function loadAppleEmojiMap() {
  if (appleEmojiMap) return appleEmojiMap;

  if (!existsSync(APPLE_EMOJI_JSON_LOCAL)) {
    const buf = await downloadFile(APPLE_EMOJI_JSON_URL);
    await writeFile(APPLE_EMOJI_JSON_LOCAL, buf);
  }

  const raw = await readFile(APPLE_EMOJI_JSON_LOCAL, 'utf-8');
  appleEmojiMap = JSON.parse(raw);
  return appleEmojiMap;
}

async function drawAppleEmoji(ctx: any, emoji: string, x: number, y: number, size: number) {
  const map = await loadAppleEmojiMap();
  const base = emojiToUnicode(emoji);
  
  const variants = [
    base,
    base.replace(/-fe0f/g, ''),
    base.toUpperCase(),
    base.replace(/-fe0f/g, '').toUpperCase()
  ];

  let b64 = null;
  for (const v of variants) {
    if (map[v]) {
      b64 = map[v];
      break;
    }
  }

  if (!b64) {
    ctx.fillText(emoji, x, y);
    return;
  }

  const buf = Buffer.from(b64, 'base64');
  const img = await loadImage(buf);
  ctx.drawImage(img, x - size / 2, y - size / 2, size, size);
}

async function ensureAssets() {
  await mkdir(FONTS_DIR, { recursive: true });

  const INTER_FONTS = [
    { url: 'https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2', file: 'Inter-Regular.ttf' },
    { url: 'https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuI6fAZ9hiJ-Ek-_EeA.woff2', file: 'Inter-Medium.ttf' },
    { url: 'https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuFuYAZ9hiJ-Ek-_EeA.woff2', file: 'Inter-SemiBold.ttf' }
  ];

  for (const f of INTER_FONTS) {
    const dest = join(FONTS_DIR, f.file);
    if (!existsSync(dest)) {
      const buf = await downloadFile(f.url);
      await writeFile(dest, buf);
    }
    if (!GlobalFonts.has('Inter')) {
      GlobalFonts.registerFromPath(dest, 'Inter');
    }
  }

  await loadAppleEmojiMap();

  if (!existsSync(BG_LOCAL)) {
    const buf = await downloadFile(BG_URL);
    await writeFile(BG_LOCAL, buf);
  }
}

function drawRoundedRect(ctx: any, x: number, y: number, w: number, h: number, r: number) {
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

function measureTextCustom(ctx: any, text: string, fontSize: number): number {
  const parts = text.split(/(\p{Extended_Pictographic})/gu);
  let totalWidth = 0;
  
  for (const part of parts) {
    if (!part) continue;
    if (/\p{Extended_Pictographic}/u.test(part)) {
      totalWidth += fontSize * 1.05;
    } else {
      totalWidth += ctx.measureText(part).width;
    }
  }
  return totalWidth;
}

async function drawTextWithEmojis(ctx: any, text: string, x: number, y: number, fontSize: number) {
  const parts = text.split(/(\p{Extended_Pictographic})/gu);
  let currentX = x;

  for (const part of parts) {
    if (!part) continue;
    if (/\p{Extended_Pictographic}/u.test(part)) {
      const emojiSize = fontSize * 1.05;
      const emojiCX = currentX + emojiSize / 2;
      const emojiCY = y;
      await drawAppleEmoji(ctx, part, emojiCX, emojiCY, emojiSize);
      currentX += emojiSize;
    } else {
      ctx.fillText(part, currentX, y);
      currentX += ctx.measureText(part).width;
    }
  }
}

function wrapText(ctx: any, text: string, maxWidth: number, fontSize: number): string[] {
  ctx.font = `500 ${fontSize}px Inter`;
  const words = text.split(" ");
  const lines: string[] = [];
  let cur = "";

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const test = cur + (cur ? " " : "") + word;
    if (measureTextCustom(ctx, test, fontSize) > maxWidth && i > 0) {
      lines.push(cur);
      cur = word;
    } else {
      cur = test;
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

export async function generateIQCPink(text: string, time: string): Promise<Buffer> {
  try {
    await ensureAssets();

    const state = {
      text: text,
      time: time,
      bubbleColor: "#ffc5d5",
      textColor: "#111111",
      timeColor: "#5e4146",
      tickColor: "#8c1d2c",
      fontSize: Math.round(45 * SX),
      bubbleWidth: Math.round(746 * SX)
    };

    const canvas = createCanvas(BG_W, BG_H);
    const ctx = canvas.getContext('2d');

    const bgImg = await loadImage(BG_LOCAL);
    ctx.drawImage(bgImg, 0, 0, BG_W, BG_H);

    const rightPadding = Math.round(80 * SX);
    const textPaddingX = Math.round(36 * SX);
    const paddingTop = Math.round(28 * SY);
    const paddingBottom = Math.round(28 * SY);
    const bRadius = Math.round(32 * SX);
    const menuTopBorderY = Math.round(1276 * SY);
    const timeFontSize = Math.round(23 * SX);

    ctx.font = `600 ${timeFontSize}px Inter`;
    const timeMetrics = ctx.measureText(state.time);
    const ticksWidth = Math.round(34 * SX);
    const timestampWidth = timeMetrics.width + ticksWidth + Math.round(12 * SX);
    const timestampHeight = timeFontSize;

    const textLimitW = state.bubbleWidth - (textPaddingX * 2);
    ctx.font = `500 ${state.fontSize}px Inter`;
    const textLines = wrapText(ctx, state.text, textLimitW, state.fontSize);
    const lineWidths = textLines.map(line => measureTextCustom(ctx, line, state.fontSize));
    const maxLineWidth = Math.max(...lineWidths, 0);

    let bubbleActualW = maxLineWidth + (textPaddingX * 2);
    const minBubbleW = Math.round(280 * SX);
    if (bubbleActualW < minBubbleW) bubbleActualW = minBubbleW;
    if (bubbleActualW > state.bubbleWidth) bubbleActualW = state.bubbleWidth;

    const bubbleX = BG_W - bubbleActualW - rightPadding;
    const lineGap = Math.round(12 * SY);
    const textTotalHeight = (textLines.length * state.fontSize) + ((textLines.length - 1) * lineGap);
    const bubbleHeight = paddingTop + textTotalHeight + paddingBottom;
    const currentBubbleY = menuTopBorderY - bubbleHeight - Math.round(28 * SY);

    // Draw bubble
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.05)";
    ctx.shadowBlur = 20;
    ctx.shadowOffsetY = 6;
    ctx.fillStyle = state.bubbleColor;
    drawRoundedRect(ctx, bubbleX, currentBubbleY, bubbleActualW, bubbleHeight, bRadius);
    ctx.fill();
    ctx.restore();

    // Draw tail
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(bubbleX + bubbleActualW - Math.round(15 * SX), currentBubbleY + bubbleHeight - 5);
    ctx.lineTo(bubbleX + bubbleActualW + Math.round(10 * SX), currentBubbleY + bubbleHeight - 5);
    ctx.quadraticCurveTo(
      bubbleX + bubbleActualW + Math.round(2 * SX),
      currentBubbleY + bubbleHeight - Math.round(20 * SY),
      bubbleX + bubbleActualW - Math.round(1 * SX),
      currentBubbleY + bubbleHeight - Math.round(32 * SY)
    );
    ctx.closePath();
    ctx.fillStyle = state.bubbleColor;
    ctx.fill();
    ctx.restore();

    // Draw text
    ctx.save();
    ctx.fillStyle = state.textColor;
    ctx.font = `400 ${state.fontSize}px Inter`;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    
    for (let i = 0; i < textLines.length; i++) {
      const lineY = currentBubbleY + paddingTop + (i * (state.fontSize + lineGap)) + (state.fontSize / 2);
      await drawTextWithEmojis(ctx, textLines[i], bubbleX + textPaddingX, lineY, state.fontSize);
    }
    ctx.restore();

    // Draw time and ticks
    ctx.save();
    const lastLineTop = currentBubbleY + paddingTop + ((textLines.length - 1) * (state.fontSize + lineGap));
    const timeY = lastLineTop + state.fontSize - timestampHeight + Math.round(2 * SY);
    const timeX = bubbleX + bubbleActualW - textPaddingX - timestampWidth;

    ctx.fillStyle = state.timeColor;
    ctx.font = `600 ${timeFontSize}px Inter`;
    ctx.textBaseline = "top";
    ctx.fillText(state.time, timeX, timeY);

    const tickX = timeX + timeMetrics.width + Math.round(10 * SX);
    const tickY = timeY + (timeFontSize / 2) - Math.round(8 * SX);

    ctx.strokeStyle = state.tickColor;
    ctx.lineWidth = 3.6 * SX;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Double check marks
    ctx.beginPath();
    ctx.moveTo(tickX, tickY + Math.round(8 * SX));
    ctx.lineTo(tickX + Math.round(6 * SX), tickY + Math.round(14 * SX));
    ctx.lineTo(tickX + Math.round(16 * SX), tickY + Math.round(2 * SX));
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(tickX + Math.round(7 * SX), tickY + Math.round(8 * SX));
    ctx.lineTo(tickX + Math.round(7 * SX) + Math.round(6 * SX), tickY + Math.round(14 * SX));
    ctx.lineTo(tickX + Math.round(7 * SX) + Math.round(16 * SX), tickY + Math.round(2 * SX));
    ctx.stroke();
    ctx.restore();

    // Return buffer
    const buffer = await canvas.encode('png');
    return buffer;

  } catch (error: any) {
    console.error('Failed to generate IQC Pink:', error);
    throw new Error(error.message || 'Failed to generate IQC Pink');
  }
}
