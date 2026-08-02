import { createCanvas, loadImage, GlobalFonts } from '@napi-rs/canvas';
import { writeFile, mkdir } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import axios from 'axios';

const THEMES: { [key: string]: { bg: string, text: string } } = {
  black: { bg: '#000000', text: '#ffffff' },
  white: { bg: '#ffffff', text: '#000000' },
  green: { bg: '#8ace00', text: '#000000' }
};

async function downloadAsset(url: string, localPath: string, isJson = false) {
    if (!existsSync(localPath)) {
        try {
            const response = await axios.get(url, { responseType: isJson ? 'json' : 'arraybuffer' });
            if (isJson) {
                await writeFile(localPath, JSON.stringify(response.data));
            } else {
                await writeFile(localPath, Buffer.from(response.data));
            }
        } catch (error) {
            console.error(`Failed to download asset from ${url}:`, error);
            throw new Error(`Failed to download asset: ${url}`);
        }
    }
}

let emojiMap: any = null;
const emojiImageCache = new Map();

function emojiToUnicode(emoji: string) {
  return [...emoji].map(c => c.codePointAt(0)!.toString(16).padStart(4, '0')).join('-');
}

async function loadEmojiMap(FONTS_DIR: string) {
  if (emojiMap) return emojiMap;
  const EMOJI_JSON_URL = 'https://media.githubusercontent.com/media/Ditzzx-vibecoder/entahlah/main/emoji-apple.json';
  const EMOJI_JSON_PATH = join(FONTS_DIR, 'emoji-apple.json');
  await downloadAsset(EMOJI_JSON_URL, EMOJI_JSON_PATH, true);
  emojiMap = JSON.parse(readFileSync(EMOJI_JSON_PATH, 'utf-8'));
  return emojiMap;
}

async function getEmojiImage(emoji: string) {
  if (emojiImageCache.has(emoji)) return emojiImageCache.get(emoji);
  const map = await loadEmojiMap(join(process.cwd(), 'assets', 'brat', 'fonts'));
  const base = emojiToUnicode(emoji);
  const variants = [ base, base.replace(/-fe0f/gi, ''), `${base.replace(/-fe0f/gi, '')}-fe0f` ];
  let b64 = null;
  for (const v of variants) {
    if (map[v]) { b64 = map[v]; break; }
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

const EMOJI_REGEX = /(\p{Emoji_Modifier_Base}\p{Emoji_Modifier}|\p{Emoji_Presentation}️?|\p{Emoji}️|[\u{1F1E0}-\u{1F1FF}]{2}|\p{Extended_Pictographic}️?)/gu;

function measureTextCustom(ctx: any, text: string, fontSize: number) {
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
      await drawAppleEmoji(ctx, part, curX, y - fontSize * 0.1, fontSize); // Adjust vertical alignment
      curX += fontSize;
    } else {
      ctx.fillText(part, curX, y);
      curX += ctx.measureText(part).width;
    }
    EMOJI_REGEX.lastIndex = 0;
  }
}

function wrapText(ctx: any, text: string, maxWidth: number, fontSize: number) {
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

function fitsAt(ctx: any, text: string, fontSize: number, maxWidth: number, maxHeight: number, lineGap: number) {
  const lines = wrapText(ctx, text, maxWidth, fontSize);
  const longestWord = Math.max(...text.split(' ').map(w => measureTextCustom(ctx, w, fontSize)));
  const totalHeight = lines.length * (fontSize + lineGap) - lineGap;
  return longestWord <= maxWidth && totalHeight <= maxHeight;
}

function findBestFontSize(ctx: any, text: string, maxWidth: number, maxHeight: number, lineGap: number) {
  let lo = 10, hi = 700, best = lo;
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

export async function generateBrat(text = 'Brat Canvas 🎨', theme = 'white', blur = 0) {
  const ASSETS_DIR = join(process.cwd(), 'assets', 'brat');
  const FONTS_DIR = join(ASSETS_DIR, 'fonts');
  await mkdir(FONTS_DIR, { recursive: true });

  const FONT_URL = 'https://raw.githubusercontent.com/Ditzzx-vibecoder/Assets/main/Font/ARIALN.ttf';
  const FONT_PATH = join(FONTS_DIR, 'ARIALN.ttf');
  await downloadAsset(FONT_URL, FONT_PATH);
  if (!GlobalFonts.has('ArialNarrow')) {
      GlobalFonts.registerFromPath(FONT_PATH, 'ArialNarrow');
  }

  await loadEmojiMap(FONTS_DIR);

  const selectedTheme = THEMES[theme] || THEMES.white;
  const blurAmount = [0, 1, 2, 3].includes(blur) ? blur : 0;

  const size = 1000, padding = 80, lineGap = 20;
  const maxWidth = size - padding * 2, maxHeight = size - padding * 2;

  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  const fontSize = findBestFontSize(ctx, text, maxWidth, maxHeight, lineGap);
  const lines = wrapText(ctx, text, maxWidth, fontSize);

  ctx.fillStyle = selectedTheme.bg;
  ctx.fillRect(0, 0, size, size);

  ctx.fillStyle = selectedTheme.text;
  ctx.font = `${fontSize}px ArialNarrow`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  if (blurAmount > 0) {
    ctx.filter = `blur(${blurAmount}px)`;
  }

  const totalTextHeight = lines.length * (fontSize + lineGap) - lineGap;
  let y = (size - totalTextHeight) / 2;

  for (const line of lines) {
    const totalWidth = measureTextCustom(ctx, line, fontSize);
    let x = (size - totalWidth) / 2;
    await drawTextWithEmojis(ctx, line, x, y, fontSize);
    y += fontSize + lineGap;
  }

  return canvas.toBuffer('image/png');
}