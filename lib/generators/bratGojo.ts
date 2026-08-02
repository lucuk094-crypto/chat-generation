import { createCanvas, loadImage, GlobalFonts } from '@napi-rs/canvas';
import { writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import axios from 'axios';

const ASSETS_DIR = join(process.cwd(), 'public', 'assets', 'bratgojo');
const FONTS_DIR = join(ASSETS_DIR, 'fonts');

async function downloadAsset(url: string, localPath: string) {
    if (existsSync(localPath)) return;
    try {
        await mkdir(join(localPath, '..'), { recursive: true });
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        await writeFile(localPath, Buffer.from(response.data));
    } catch (error) {
        console.error(`Failed to download asset from ${url}:`, error);
        throw new Error(`Failed to download asset: ${url}`);
    }
}

const TEXT_STYLE = {
  fontFamily: "Poppins",
  maxFontSize: 90,
  minFontSize: 22,
  lineHeight: 1.18,
  color: "#111111",
  align: "center"
};

const BRAT_IMAGE_URL = "https://raw.githubusercontent.com/Ditzzx-vibecoder/Assets/main/Brat/Gojo.jpeg";
const BRAT_FONT_URL = "https://raw.githubusercontent.com/Ditzzx-vibecoder/Assets/main/Brat/Poppins.ttf";

const CANVAS = {
  width: 1254,
  height: 1254
};

const SAFE_ZONE = {
  a: 660,
  b: 1180,
  c: 270,
  d: 990
};

function normalizeText(text: string) {
  return String(text || "").replace(/\r/g, "").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}

function getSafeRect(zone: {a: number, b: number, c: number, d: number}) {
  return {
    x: zone.c,
    y: zone.a,
    w: zone.d - zone.c,
    h: zone.b - zone.a,
    centerX: (zone.c + zone.d) / 2,
    centerY: (zone.a + zone.b) / 2
  };
}

function setFont(ctx: any, size: number) {
  ctx.font = `${size}px ${TEXT_STYLE.fontFamily}`;
}

function splitLongWord(ctx: any, word: string, maxWidth: number) {
  const chars = [...word];
  const parts: string[] = [];
  let current = "";

  for (const char of chars) {
    const test = current + char;
    if (ctx.measureText(test).width <= maxWidth || !current) {
      current = test;
    } else {
      parts.push(current);
      current = char;
    }
  }
  if (current) {
    parts.push(current);
  }
  return parts;
}

function wrapParagraph(ctx: any, paragraph: string, maxWidth: number) {
  const words = paragraph.split(" ").filter(Boolean);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width <= maxWidth) {
      current = test;
      continue;
    }
    if (current) {
      lines.push(current);
      current = "";
    }
    if (ctx.measureText(word).width <= maxWidth) {
      current = word;
    } else {
      const parts = splitLongWord(ctx, word, maxWidth);
      lines.push(...parts.slice(0, -1));
      current = parts.at(-1) || "";
    }
  }
  if (current) {
    lines.push(current);
  }
  return lines;
}

function wrapText(ctx: any, text: string, maxWidth: number) {
  return text.split("\n").flatMap((paragraph) => {
    const clean = paragraph.trim();
    if (!clean) return [""];
    return wrapParagraph(ctx, clean, maxWidth);
  });
}

function fitText(ctx: any, text: string, rect: {w: number, h: number}) {
  for (let size = TEXT_STYLE.maxFontSize; size >= TEXT_STYLE.minFontSize; size--) {
    setFont(ctx, size);
    const lineHeight = Math.ceil(size * TEXT_STYLE.lineHeight);
    const lines = wrapText(ctx, text, rect.w);
    const totalHeight = lines.length * lineHeight;
    if (totalHeight <= rect.h) return { size, lines, lineHeight, totalHeight };
  }
  const size = TEXT_STYLE.minFontSize;
  setFont(ctx, size);
  const lineHeight = Math.ceil(size * TEXT_STYLE.lineHeight);
  const lines = wrapText(ctx, text, rect.w);
  const maxLines = Math.max(1, Math.floor(rect.h / lineHeight));
  const clipped = lines.slice(0, maxLines);
  if (lines.length > maxLines && clipped.length) {
    let last = clipped[clipped.length - 1];
    while (last.length > 0 && ctx.measureText(`${last}...`).width > rect.w) {
      last = last.slice(0, -1);
    }
    clipped[clipped.length - 1] = `${last}...`;
  }
  return { size, lines: clipped, lineHeight, totalHeight: clipped.length * lineHeight };
}

function drawCenteredText(ctx: any, text: string, zone: any) {
  const rect = getSafeRect(zone);
  const fitted = fitText(ctx, text, rect);
  const startY = rect.y + (rect.h - fitted.totalHeight) / 2;

  ctx.save();
  ctx.beginPath();
  ctx.rect(rect.x, rect.y, rect.w, rect.h);
  ctx.clip();
  setFont(ctx, fitted.size);
  ctx.fillStyle = TEXT_STYLE.color;
  ctx.textAlign = TEXT_STYLE.align as CanvasTextAlign;
  ctx.textBaseline = "top";
  fitted.lines.forEach((line, index) => {
    const y = startY + index * fitted.lineHeight;
    ctx.fillText(line, rect.centerX, y);
  });
  ctx.restore();
}

export async function generateBratGojo(text: string): Promise<Buffer> {
    await mkdir(FONTS_DIR, { recursive: true });

    const FONT_PATH = join(FONTS_DIR, 'Poppins.ttf');
    await downloadAsset(BRAT_FONT_URL, FONT_PATH);
    if (!GlobalFonts.has('Poppins')) {
        GlobalFonts.registerFromPath(FONT_PATH, 'Poppins');
    }

    const bgImgBuffer = await (await axios.get(BRAT_IMAGE_URL, { responseType: 'arraybuffer'})).data;
    const bgImg = await loadImage(bgImgBuffer);

    const canvas = createCanvas(CANVAS.width, CANVAS.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

    drawCenteredText(ctx, normalizeText(text), SAFE_ZONE);

    return canvas.toBuffer('image/png');
}
