import { createCanvas, loadImage, GlobalFonts } from '@napi-rs/canvas';
import { writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import axios from 'axios';

const BG_URL = 'https://raw.githubusercontent.com/ryyntwx/allimagerin/refs/heads/main/IMG-20260710-WA1772.jpg';
const ASSETS_DIR = join(process.cwd(), 'assets', 'polisimeme');
const FONTS_DIR = join(ASSETS_DIR, 'fonts');
const BG_LOCAL = join(ASSETS_DIR, 'template_polisi.png');

export async function generateTimpaTeks(username: string, text: string): Promise<Buffer> {
  try {
    // Setup directories
    await mkdir(FONTS_DIR, { recursive: true });

    // Download and register font if not exists
    const fontPath = join(FONTS_DIR, 'Inter-Bold.ttf');
    if (!existsSync(fontPath)) {
      const fontUrl = 'https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuFuYAZ9hiJ-Ek-_EeA.woff2';
      const fontRes = await axios.get(fontUrl, { 
        responseType: 'arraybuffer',
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      await writeFile(fontPath, Buffer.from(fontRes.data));
    }

    if (!GlobalFonts.has('MemeInterBold')) {
      GlobalFonts.registerFromPath(fontPath, 'MemeInterBold');
    }

    // Download background if not exists
    if (!existsSync(BG_LOCAL)) {
      const bgRes = await axios.get(BG_URL, { 
        responseType: 'arraybuffer',
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      await writeFile(BG_LOCAL, Buffer.from(bgRes.data));
    }

    const bgImg = await loadImage(BG_LOCAL);
    const canvas = createCanvas(bgImg.width, bgImg.height);
    const ctx = canvas.getContext('2d');

    // Draw background
    ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

    // Paper area coordinates (where text will be drawn)
    const paperX = 404;
    const paperY = 324;
    const paperW = 53;
    const paperH = 120;

    // Text settings
    let fontSize = 23;
    let lineHeight = 31;
    const senderSize = 15;
    const senderOffset = 0;

    // Format username
    const txtUsername = username.startsWith('~') ? username : `~ ${username}`;

    // Split text into pairs of words (2 words per line)
    const words = text.split(/\s+/);
    const lines: string[] = [];
    for (let i = 0; i < words.length; i += 2) {
      const pair = words.slice(i, i + 2).join(' ');
      if (pair) lines.push(pair);
    }

    // Calculate safe area for text
    const safetyMargin = senderSize + senderOffset + 10;
    const maxTextHeight = paperH - safetyMargin;

    // Auto-adjust font size if text is too long
    while (fontSize > 8) {
      const totalHeight = lines.length * lineHeight;
      if (totalHeight <= maxTextHeight) {
        break;
      }
      fontSize -= 1;
      lineHeight -= 1.2;
    }

    const centerX = paperX + (paperW / 2);

    // Draw username at bottom
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillStyle = '#262626';
    ctx.font = `bold ${senderSize}px MemeInterBold`;
    ctx.fillText(txtUsername, centerX, paperY + paperH - senderOffset);

    // Calculate starting Y position for centered text
    const totalTextHeight = lines.length * lineHeight;
    let startY = paperY + ((maxTextHeight - totalTextHeight) / 2);
    if (startY < paperY) startY = paperY;

    // Draw main text (2 words per line)
    ctx.textBaseline = 'top';
    ctx.font = `bold ${fontSize}px MemeInterBold`;
    lines.forEach((line, index) => {
      const currentY = startY + (index * lineHeight);
      if (currentY + fontSize <= paperY + maxTextHeight) {
        ctx.fillText(line, centerX, currentY);
      }
    });

    // Return canvas buffer
    const buffer = await canvas.encode('png');
    return buffer;

  } catch (error: any) {
    console.error('Failed to generate Timpa Teks:', error);
    throw new Error(error.message || 'Failed to generate Timpa Teks image');
  }
}
