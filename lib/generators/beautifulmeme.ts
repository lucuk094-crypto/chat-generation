import { createCanvas, loadImage } from '@napi-rs/canvas';
import { writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import axios from 'axios';

const BG_URL = "https://cdn.jsdelivr.net/gh/Ditzzx-vibecoder/Assets@main/Image/2image.jpeg";
const CANVAS_SIZE = { width: 1217, height: 1280 };
const ASSETS_DIR = join(process.cwd(), 'assets', 'beautiful');
const BG_LOCAL = join(ASSETS_DIR, '2image.jpeg');

async function download(url: string): Promise<Buffer> {
  const res = await axios.get(url, {
    responseType: 'arraybuffer',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  });
  return Buffer.from(res.data);
}

async function prepareAssets() {
  await mkdir(ASSETS_DIR, { recursive: true });

  if (!existsSync(BG_LOCAL)) {
    await writeFile(BG_LOCAL, await download(BG_URL));
  }

  return BG_LOCAL;
}

function drawImageCover(ctx: any, img: any, x: number, y: number, w: number, h: number) {
  const imgRatio = img.width / img.height;
  const targetRatio = w / h;

  let sx: number, sy: number, sw: number, sh: number;

  if (imgRatio > targetRatio) {
    sh = img.height;
    sw = sh * targetRatio;
    sx = (img.width - sw) / 2;
    sy = 0;
  } else {
    sw = img.width;
    sh = sw / targetRatio;
    sx = 0;
    sy = (img.height - sh) / 2;
  }

  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
}

export async function generateBeautifulMeme(image1Url: string, image2Url: string): Promise<Buffer> {
  try {
    // Prepare background
    const bgLocal = await prepareAssets();

    // Create canvas
    const canvas = createCanvas(CANVAS_SIZE.width, CANVAS_SIZE.height);
    const ctx = canvas.getContext('2d');

    // Draw background
    const bgImg = await loadImage(bgLocal);
    ctx.drawImage(bgImg, 0, 0, CANVAS_SIZE.width, CANVAS_SIZE.height);

    // Download and draw image 1
    ctx.save();
    const img1Buffer = await download(image1Url);
    const img1 = await loadImage(img1Buffer);
    drawImageCover(ctx, img1, 833, 61, 305, 344);
    ctx.restore();

    // Download and draw image 2
    ctx.save();
    const img2Buffer = await download(image2Url);
    const img2 = await loadImage(img2Buffer);
    drawImageCover(ctx, img2, 841, 719, 299, 348);
    ctx.restore();

    // Return buffer
    const buffer = await canvas.encode('png');
    return buffer;

  } catch (error: any) {
    console.error('Failed to generate Beautiful Meme:', error);
    throw new Error(error.message || 'Failed to generate Beautiful Meme');
  }
}
