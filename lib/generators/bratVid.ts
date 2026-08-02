import { createCanvas, loadImage, GlobalFonts } from '@napi-rs/canvas';
import { writeFileSync, existsSync, readFileSync, mkdtempSync, rmSync } from 'fs';
import { writeFile, mkdir } from 'node:fs/promises';
import path from 'path';
import os from 'os';
import { execFile } from 'child_process';
import { promisify } from 'util';
import axios from 'axios';
import ffmpegPath from 'ffmpeg-static';

const execFileAsync = promisify(execFile);

const FONT_URL = 'https://raw.githubusercontent.com/Ditzzx-vibecoder/Assets/main/Font/ARIALN.ttf';
const EMOJI_JSON_URL = 'https://media.githubusercontent.com/media/Ditzzx-vibecoder/entahlah/main/emoji-apple.json';

const ASSETS_DIR = path.join(process.cwd(), 'public', 'assets', 'brat');
const FONTS_DIR = path.join(ASSETS_DIR, 'fonts');
const FONT_PATH = path.join(FONTS_DIR, 'ARIALN.ttf');
const EMOJI_JSON_PATH = path.join(FONTS_DIR, 'emoji-apple.json');

const THEMES: Record<string, { bg: string; text: string }> = {
  black: { bg: '#000000', text: '#ffffff' },
  white: { bg: '#ffffff', text: '#000000' },
  green: { bg: '#8ace00', text: '#000000' }
};

async function downloadAsset(url: string, localPath: string) {
  if (existsSync(localPath)) return;
  try {
    await mkdir(path.dirname(localPath), { recursive: true });
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    await writeFile(localPath, Buffer.from(response.data));
  } catch (error) {
    console.error(`Failed to download asset from ${url}:`, error);
    throw new Error(`Failed to download asset: ${url}`);
  }
}

async function ensureFont() {
  await downloadAsset(FONT_URL, FONT_PATH);
  if (!GlobalFonts.has('ArialNarrow')) {
    GlobalFonts.registerFromPath(FONT_PATH, 'ArialNarrow');
  }
}

let emojiMap: Record<string, string> | null = null;
const emojiImageCache = new Map<string, any>();

function emojiToUnicode(emoji: string): string {
  return [...emoji].map(c => c.codePointAt(0)!.toString(16).padStart(4, '0')).join('-');
}

async function loadEmojiMap() {
  if (emojiMap) return emojiMap;
  await downloadAsset(EMOJI_JSON_URL, EMOJI_JSON_PATH);
  emojiMap = JSON.parse(readFileSync(EMOJI_JSON_PATH, 'utf-8'));
  return emojiMap;
}

async function getEmojiImage(emoji: string) {
  if (emojiImageCache.has(emoji)) return emojiImageCache.get(emoji);
  const map = await loadEmojiMap();
  const base = emojiToUnicode(emoji);
  const variants = [
    base,
    base.replace(/-fe0f/gi, ''),
    `${base.replace(/-fe0f/gi, '')}-fe0f`,
    base.toUpperCase(),
    base.replace(/-fe0f/gi, '').toUpperCase(),
    base.replace(/-fe0f/gi, '').toUpperCase() + '-FE0F'
  ];

  let b64: string | null = null;
  for (const v of variants) {
    if (map && map[v]) { b64 = map[v]; break; }
  }
  if (!b64) return null;

  const img = await loadImage(Buffer.from(b64, 'base64'));
  emojiImageCache.set(emoji, img);
  return img;
}

async function drawAppleEmoji(ctx: any, emoji: string, x: number, y: number, size: number) {
  const img = await getEmojiImage(emoji);
  if (!img) { ctx.fillText(emoji, x, y); return; }
  ctx.drawImage(img, x, y, size, size);
}

const EMOJI_REGEX = /(\p{Emoji_Modifier_Base}\p{Emoji_Modifier}|\p{Emoji_Presentation}\uFE0F?|\p{Emoji}\uFE0F|[\u{1F1E0}-\u{1F1FF}]{2}|\p{Extended_Pictographic}\uFE0F?)/gu;

function measureTextCustom(ctx: any, text: string, fontSize: number): number {
  const parts = text.split(EMOJI_REGEX);
  let w = 0;
  for (const part of parts) {
    if (!part) continue;
    EMOJI_REGEX.lastIndex = 0;
    if (EMOJI_REGEX.test(part)) w += fontSize;
    else w += ctx.measureText(part).width;
    EMOJI_REGEX.lastIndex = 0;
  }
  return w;
}

async function drawTextWithEmojis(ctx: any, text: string, x: number, y: number, fontSize: number) {
  const parts = text.split(EMOJI_REGEX);
  let curX = x;
  for (const part of parts) {
    if (!part) continue;
    EMOJI_REGEX.lastIndex = 0;
    if (EMOJI_REGEX.test(part)) {
      await drawAppleEmoji(ctx, part, curX, y, fontSize);
      curX += fontSize;
    } else {
      ctx.fillText(part, curX, y);
      curX += ctx.measureText(part).width;
    }
    EMOJI_REGEX.lastIndex = 0;
  }
}

function wrapText(ctx: any, text: string, maxWidth: number, fontSize: number): string[] {
  ctx.font = `${fontSize}px ArialNarrow`;
  const words = text.split(' ');
  const lines: string[] = [];
  let cur = '';
  for (const word of words) {
    const test = cur ? cur + ' ' + word : word;
    if (measureTextCustom(ctx, test, fontSize) > maxWidth && cur) {
      lines.push(cur);
      cur = word;
    } else {
      cur = test;
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

function fitsAt(ctx: any, text: string, fontSize: number, maxWidth: number, maxHeight: number, lineGap: number): boolean {
  const lines = wrapText(ctx, text, maxWidth, fontSize);
  const longestWord = Math.max(...text.split(' ').map(w => measureTextCustom(ctx, w, fontSize)));
  const totalHeight = lines.length * (fontSize + lineGap) - lineGap;
  return longestWord <= maxWidth && totalHeight <= maxHeight;
}

function findBestFontSize(ctx: any, text: string, maxWidth: number, maxHeight: number, lineGap: number): number {
  let lo = 10;
  let hi = 700;
  let best = lo;
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (fitsAt(ctx, text, mid, maxWidth, maxHeight, lineGap)) {
      best = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  return best;
}

function tokenize(text: string): string[] {
  return text.split(' ').filter(Boolean);
}

async function renderCanvas(text: string, theme: string, blurAmount: number) {
  const selectedTheme = THEMES[theme] || THEMES.white;
  const size = 1000;
  const padding = 80;
  const lineGap = 20;
  const maxWidth = size - padding * 2;
  const maxHeight = size - padding * 2;

  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = selectedTheme.bg;
  ctx.fillRect(0, 0, size, size);

  if (!text.trim()) return canvas;

  const fontSize = findBestFontSize(ctx, text, maxWidth, maxHeight, lineGap);
  const lines = wrapText(ctx, text, maxWidth, fontSize);

  ctx.fillStyle = selectedTheme.text;
  ctx.font = `${fontSize}px ArialNarrow`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  ctx.save();
  if (blurAmount > 0) ctx.filter = `blur(${blurAmount}px)`;

  const totalTextHeight = lines.length * (fontSize + lineGap) - lineGap;
  let y = (size - totalTextHeight) / 2;

  for (const line of lines) {
    await drawTextWithEmojis(ctx, line, padding, y, fontSize);
    y += fontSize + lineGap;
  }

  ctx.restore();
  return canvas;
}

interface BratVidOptions {
  text: string;
  theme?: string;
  blur?: number;
  format?: string;
  frameDuration?: number;
  holdDuration?: number;
  maxWordPerLayer?: number;
  maxWordBeforeReset?: number | number[];
  fastProgress?: boolean;
}

export async function generateBratVideo({
  text = 'Halo Guys Nama Saya',
  theme = 'white',
  blur = 0,
  format = 'mp4',
  frameDuration = 0.35,
  holdDuration = 1.2,
  maxWordPerLayer = 1,
  maxWordBeforeReset = 0,
  fastProgress = false
}: BratVidOptions): Promise<Buffer> {
  const blurAmount = [0, 1, 2, 3].includes(blur) ? blur : 0;
  const step = Math.max(1, maxWordPerLayer);

  const resetSchedule = Array.isArray(maxWordBeforeReset)
    ? maxWordBeforeReset.map(n => Math.max(0, n))
    : [Math.max(0, maxWordBeforeReset)];

  const getResetAt = (batchIndex: number) => resetSchedule[batchIndex % resetSchedule.length];

  await ensureFont();
  await loadEmojiMap();

  const tokens = tokenize(text);
  if (!tokens.length) throw new Error('Teks kosong');

  const tmpDir = mkdtempSync(path.join(os.tmpdir(), 'brat-'));
  const partialTexts: string[] = [];

  let batchStart = 0;
  let batchIndex = 0;

  while (batchStart < tokens.length) {
    const resetAt = getResetAt(batchIndex);
    const batchEnd = resetAt > 0 ? Math.min(batchStart + resetAt, tokens.length) : tokens.length;

    for (let i = batchStart + step; i < batchEnd; i += step) {
      partialTexts.push(tokens.slice(batchStart, i).join(' '));
    }
    partialTexts.push(tokens.slice(batchStart, batchEnd).join(' '));

    batchStart = batchEnd;
    batchIndex++;
  }

  const renderFrame = async (partialText: string, index: number) => {
    const canvas = await renderCanvas(partialText, theme, blurAmount);
    const buffer = await canvas.encode('png');
    const framePath = path.join(tmpDir, `frame-${String(index + 1).padStart(4, '0')}.png`);
    writeFileSync(framePath, buffer);
    return framePath;
  };

  let framePaths: string[];
  if (fastProgress) {
    framePaths = await Promise.all(partialTexts.map((t, i) => renderFrame(t, i)));
  } else {
    framePaths = [];
    for (let i = 0; i < partialTexts.length; i++) {
      framePaths.push(await renderFrame(partialTexts[i], i));
    }
  }

  const durations = framePaths.map((_, i) =>
    i === framePaths.length - 1 ? holdDuration : frameDuration
  );

  const manifestLines: string[] = [];
  for (let i = 0; i < framePaths.length; i++) {
    manifestLines.push(`file '${framePaths[i].replace(/'/g, "'\\''")}'`);
    manifestLines.push(`duration ${durations[i]}`);
  }
  manifestLines.push(`file '${framePaths[framePaths.length - 1].replace(/'/g, "'\\''")}'`);

  const concatPath = path.join(tmpDir, 'concat.txt');
  writeFileSync(concatPath, manifestLines.join('\n'));

  const ext = format === 'gif' ? 'gif' : 'mp4';
  const outPath = path.join(tmpDir, `output.${ext}`);

  if (format === 'gif') {
    await execFileAsync(ffmpegPath!, [
      '-y',
      '-f', 'concat', '-safe', '0', '-i', concatPath,
      '-vf', 'fps=10,scale=1000:1000:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=64[p];[s1][p]paletteuse=dither=bayer',
      '-loop', '0',
      outPath
    ]);
  } else {
    await execFileAsync(ffmpegPath!, [
      '-y',
      '-f', 'concat', '-safe', '0', '-i', concatPath,
      '-vf', 'scale=1000:1000',
      '-c:v', 'libx264',
      '-preset', 'fast',
      '-crf', '18',
      '-pix_fmt', 'yuv420p',
      '-movflags', '+faststart',
      outPath
    ]);
  }

  const videoBuffer = readFileSync(outPath);
  rmSync(tmpDir, { recursive: true, force: true });

  return videoBuffer;
}
