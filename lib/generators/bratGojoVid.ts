import { createCanvas, loadImage, GlobalFonts } from '@napi-rs/canvas';
import { writeFileSync, mkdtempSync, rmSync } from 'fs';
import { writeFile, mkdir, readFile } from 'node:fs/promises';
import path from 'path';
import os from 'os';
import { execFile } from 'child_process';
import { promisify } from 'util';
import axios from 'axios';
import { existsSync } from 'fs';
import ffmpegPath from 'ffmpeg-static';

const execFileAsync = promisify(execFile);

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

const TEXT_STYLE = {
  fontFamily: "Poppins",
  maxFontSize: 90,
  minFontSize: 22,
  lineHeight: 1.18,
  color: "#111111",
  align: "center"
};

const VIDEO_CONFIG = {
  outputFormat: "mp4",
  fast_progress: true,
  fps: 24,
  width: 512,
  height: 512,
  lyric: {
    maxWordPerLayer: 5,
    frameDuration: 0.7,
    lastFrameDuration: 1.5
  }
};

const ASSETS_DIR = path.join(process.cwd(), 'public', 'assets', 'bratgojo');
const FONTS_DIR = path.join(ASSETS_DIR, 'fonts');

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

function normalizeText(text: string) {
  return String(text || "").replace(/\r/g, "").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}

function tokenize(text: string): string[] {
  return normalizeText(text).replace(/[,，]/g, " ").split(/\s+/).map((v) => v.trim()).filter(Boolean);
}

function splitIntoLayers(tokens: string[], maxWordPerLayer: number) {
  if (!Number.isFinite(maxWordPerLayer) || maxWordPerLayer <= 0) {
    return [tokens];
  }
  const layers: string[][] = [];
  for (let i = 0; i < tokens.length; i += maxWordPerLayer) {
    layers.push(tokens.slice(i, i + maxWordPerLayer));
  }
  return layers;
}

interface Frame {
  text: string;
  isLastInLayer: boolean;
  duration?: number;
}

function resolveDurations(frames: Frame[], lyric: any) {
  return frames.map((frame) => {
    return frame.isLastInLayer
      ? Math.max(0.05, lyric.lastFrameDuration)
      : Math.max(0.05, lyric.frameDuration);
  });
}

function buildRevealFrames(text: string, config: any) {
  const tokens = tokenize(text);
  const layers = splitIntoLayers(tokens, config.lyric.maxWordPerLayer);
  const frames: Frame[] = [];

  for (const layer of layers) {
    let current = "";
    for (let i = 0; i < layer.length; i++) {
      current += (current ? " " : "") + layer[i];
      frames.push({
        text: current,
        isLastInLayer: i === layer.length - 1
      });
    }
  }

  const durations = resolveDurations(frames, config.lyric);
  return frames.map((frame, index) => ({
    ...frame,
    duration: durations[index]
  }));
}

function getSafeRect(zone: any) {
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
  if (current) parts.push(current);
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
  if (current) lines.push(current);
  return lines;
}

function wrapText(ctx: any, text: string, maxWidth: number) {
  return text.split("\n").flatMap((paragraph) => {
    const clean = paragraph.trim();
    return clean ? wrapParagraph(ctx, clean, maxWidth) : [""];
  });
}

function fitText(ctx: any, text: string, rect: any) {
  for (let size = TEXT_STYLE.maxFontSize; size >= TEXT_STYLE.minFontSize; size--) {
    setFont(ctx, size);
    const lineHeight = Math.ceil(size * TEXT_STYLE.lineHeight);
    const lines = wrapText(ctx, text, rect.w);
    const totalHeight = lines.length * lineHeight;
    if (totalHeight <= rect.h) {
      return { size, lines, lineHeight, totalHeight };
    }
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
  
  for (let i = 0; i < fitted.lines.length; i++) {
    ctx.fillText(fitted.lines[i], rect.centerX, startY + i * fitted.lineHeight);
  }
  
  ctx.restore();
}

async function createFrame(image: any, text: string, filePath: string) {
  const canvas = createCanvas(CANVAS.width, CANVAS.height);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(image, 0, 0, CANVAS.width, CANVAS.height);
  drawCenteredText(ctx, text, SAFE_ZONE);
  writeFileSync(filePath, await canvas.encode("png"));
}

function escapeConcatPath(filePath: string) {
  return filePath.replace(/'/g, "'\\''");
}

function buildManifest(frames: Frame[], framePaths: string[]) {
  const lines: string[] = [];
  for (let i = 0; i < frames.length; i++) {
    lines.push(`file '${escapeConcatPath(framePaths[i])}'`);
    lines.push(`duration ${frames[i].duration}`);
  }
  lines.push(`file '${escapeConcatPath(framePaths[framePaths.length - 1])}'`);
  return lines.join("\n");
}

async function encodeVideo(concatPath: string, outputPath: string, config: any) {
  if (config.outputFormat !== "mp4") {
    throw new Error("Saat ini output hanya support mp4");
  }

  const args = [
    "-y",
    "-f", "concat",
    "-safe", "0",
    "-i", concatPath,
    "-vf", `fps=${config.fps},scale=${config.width}:${config.height}:flags=lanczos`,
    "-c:v", "libx264",
    "-preset", "fast",
    "-crf", "18",
    "-pix_fmt", "yuv420p",
    "-movflags", "+faststart",
    outputPath
  ];

  await execFileAsync(ffmpegPath!, args, {
    maxBuffer: 1024 * 1024 * 10
  });
}

export async function generateBratGojoVideo(text: string): Promise<Buffer> {
  const inputText = normalizeText(text);
  const frames = buildRevealFrames(inputText, VIDEO_CONFIG);

  if (!frames.length) {
    throw new Error("Teks kosong");
  }

  // Setup fonts
  await mkdir(FONTS_DIR, { recursive: true });
  const FONT_PATH = path.join(FONTS_DIR, 'Poppins.ttf');
  await downloadAsset(BRAT_FONT_URL, FONT_PATH);
  if (!GlobalFonts.has('Poppins')) {
    GlobalFonts.registerFromPath(FONT_PATH, 'Poppins');
  }

  const tmpDir = mkdtempSync(path.join(os.tmpdir(), "bratvid-gojo-"));
  const outputPath = path.join(tmpDir, 'output.mp4');

  try {
    // Download background image
    const bgImgBuffer = await (await axios.get(BRAT_IMAGE_URL, { responseType: 'arraybuffer' })).data;
    const image = await loadImage(bgImgBuffer);

    // Generate frame paths
    const framePaths = frames.map((_, index) => {
      return path.join(tmpDir, `frame-${String(index + 1).padStart(4, "0")}.png`);
    });

    // Create frames in parallel batches
    const batchSize = 5;
    for (let start = 0; start < frames.length; start += batchSize) {
      const batch = frames.slice(start, start + batchSize);
      await Promise.all(
        batch.map((frame, i) => {
          const index = start + i;
          console.log(`Progress: ${index + 1}/${frames.length} - ${frame.text}`);
          return createFrame(image, frame.text, framePaths[index]);
        })
      );
    }

    // Create concat manifest
    const concatPath = path.join(tmpDir, "concat.txt");
    writeFileSync(concatPath, buildManifest(frames, framePaths));

    // Encode video
    await encodeVideo(concatPath, outputPath, VIDEO_CONFIG);

    // Read video buffer
    const videoBuffer = await readFile(outputPath);

    return videoBuffer;
  } finally {
    // Cleanup temp directory
    rmSync(tmpDir, { recursive: true, force: true });
  }
}
