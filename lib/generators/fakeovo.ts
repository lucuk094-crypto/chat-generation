import { createCanvas, loadImage, GlobalFonts } from '@napi-rs/canvas';
import { writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import axios from 'axios';

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

function formatAmount(input: string) {
  const digits = String(input).replace(/[^\d]/g, "") || "0";
  const normalized = digits.replace(/^0+(?=\d)/, "");
  return normalized.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export async function generateFakeOvo(nominal: string): Promise<Buffer> {
    const ASSETS_DIR = join(process.cwd(), 'assets', 'fakeovo');
    const FONTS_DIR = join(ASSETS_DIR, 'fonts');
    await mkdir(FONTS_DIR, { recursive: true });

    const FONT_URL = 'https://cdn.jsdelivr.net/fontsource/fonts/plus-jakarta-sans@latest/latin-800-normal.ttf';
    const BG_URL = 'https://raw.githubusercontent.com/Ditzzx-vibecoder/Assets/main/Image/file_0000000078bc71fa87da5cf26dc6c008.jpeg';

    const FONT_PATH = join(FONTS_DIR, 'PlusJakartaSans-ExtraBold.ttf');
    const BG_LOCAL = join(ASSETS_DIR, 'fakeovo-bg.jpeg');

    await downloadAsset(FONT_URL, FONT_PATH);
    await downloadAsset(BG_URL, BG_LOCAL);

    if (!GlobalFonts.has('Plus Jakarta Sans')) {
        GlobalFonts.registerFromPath(FONT_PATH, 'Plus Jakarta Sans');
    }

    const bgImg = await loadImage(BG_LOCAL);
    const canvas = createCanvas(bgImg.width, bgImg.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

    // Fixed "Rp" text
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.font = `800 20px "Plus Jakarta Sans"`;
    ctx.fillText("Rp", 61, 368);

    // Dynamic Amount Text
    const amountText = formatAmount(nominal);
    ctx.font = `800 28px "Plus Jakarta Sans"`;
    ctx.fillText(amountText, 94, 371);

    return canvas.toBuffer('image/png');
}