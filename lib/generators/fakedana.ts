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

export async function generateFakeDana(nominal: string): Promise<Buffer> {
    const ASSETS_DIR = join(process.cwd(), 'assets', 'fakedana');
    const FONTS_DIR = join(ASSETS_DIR, 'fonts');
    await mkdir(FONTS_DIR, { recursive: true });

    const FONT_URL = 'https://cdn.jsdelivr.net/fontsource/fonts/plus-jakarta-sans@latest/latin-600-normal.ttf';
    const BG_URL = 'https://raw.githubusercontent.com/ryyntwx/Image-rinn/refs/heads/main/fkedana.png';
    const EYE_URL = 'https://raw.githubusercontent.com/ryyntwx/Image-rinn/refs/heads/main/IMG-20260726-WA1031.jpg';

    const FONT_PATH = join(FONTS_DIR, 'PlusJakartaSans-SemiBold.ttf');
    const BG_LOCAL = join(ASSETS_DIR, 'fkedana.png');
    const EYE_LOCAL = join(ASSETS_DIR, 'eye_icon.jpg');

    await downloadAsset(FONT_URL, FONT_PATH);
    await downloadAsset(BG_URL, BG_LOCAL);
    await downloadAsset(EYE_URL, EYE_LOCAL);

    if (!GlobalFonts.has('DANA')) {
        GlobalFonts.registerFromPath(FONT_PATH, 'DANA');
    }

    const bgImg = await loadImage(BG_LOCAL);
    const eyeImg = await loadImage(EYE_LOCAL);

    const canvas = createCanvas(bgImg.width, bgImg.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

    const valX = 138;
    const valY = 52;
    const maxFontSize = 37;
    const eyeGap = 7;
    const eyeScale = 1.3;

    let currentFontSize = maxFontSize;
    const maxAllowedWidth = canvas.width - valX - 100;

    ctx.font = `600 ${currentFontSize}px DANA`;
    let textWidth = ctx.measureText(nominal).width;

    while (textWidth > maxAllowedWidth && currentFontSize > 16) {
        currentFontSize -= 2;
        ctx.font = `600 ${currentFontSize}px DANA`;
        textWidth = ctx.measureText(nominal).width;
    }

    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(nominal, valX, valY);

    const eyeHeight = currentFontSize * eyeScale;
    const eyeWidth = (eyeImg.width / eyeImg.height) * eyeHeight;
    const eyeX = valX + textWidth + eyeGap;
    const eyeY = valY + (currentFontSize - eyeHeight) / 2;

    ctx.drawImage(eyeImg, eyeX, eyeY, eyeWidth, eyeHeight);

    return canvas.toBuffer('image/png');
}