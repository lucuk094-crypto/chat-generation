import { createCanvas, loadImage, Image as CanvasImage, GlobalFonts } from '@napi-rs/canvas';
import { writeFile, mkdir } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import axios from 'axios';

// --- Consolidated Asset and Font Handling ---

const ASSETS_DIR = join(process.cwd(), 'assets', 'whatsapp');
const FONTS_DIR = join(ASSETS_DIR, 'fonts');

async function downloadAsset(url: string, localPath: string, isJson = false) {
    if (existsSync(localPath)) return;
    try {
        await mkdir(join(localPath, '..'), { recursive: true });
        const response = await axios.get(url, { responseType: isJson ? 'json' : 'arraybuffer' });
        const data = isJson ? JSON.stringify(response.data) : Buffer.from(response.data);
        await writeFile(localPath, data);
    } catch (error) {
        console.error(`Failed to download asset from ${url}:`, error);
        throw new Error(`Failed to download asset: ${url}`);
    }
}

async function setupFontsAndAssets() {
    await mkdir(FONTS_DIR, { recursive: true });
    const assets = [
        { url: 'https://raw.githubusercontent.com/ryyntwx/allimagerin/refs/heads/main/iqc-hytam.png', path: join(ASSETS_DIR, 'iqc-hytam.png') },
        { url: 'https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2', path: join(FONTS_DIR, 'Inter-Regular.woff2') },
        { url: 'https://media.githubusercontent.com/media/Ditzzx-vibecoder/entahlah/main/emoji-apple.json', path: join(FONTS_DIR, 'emoji-apple.json'), isJson: true },
    ];
    for (const asset of assets) {
        await downloadAsset(asset.url, asset.path, asset.isJson);
    }
    if (!GlobalFonts.has('InterRegular')) {
        GlobalFonts.registerFromPath(join(FONTS_DIR, 'Inter-Regular.woff2'), 'InterRegular');
    }
}

// --- Emoji Handling Logic ---

let appleEmojiMap: any = null;
const emojiImageCache = new Map<string, CanvasImage>();
const EMOJI_REGEX = /(\p{Emoji_Modifier_Base}\p{Emoji_Modifier}|\p{Emoji_Presentation}️?|\p{Emoji}️|[\u{1F1E0}-\u{1F1FF}]{2}|\p{Extended_Pictographic}️?)/gu;

async function loadAppleEmojiMap() {
    if (appleEmojiMap) return;
    const emojiJsonPath = join(FONTS_DIR, 'emoji-apple.json');
    if (existsSync(emojiJsonPath)) {
        appleEmojiMap = JSON.parse(readFileSync(emojiJsonPath, 'utf-8'));
    } else {
        appleEmojiMap = {}; // Fallback to an empty map
    }
}

function emojiToUnicode(emoji: string) {
    return [...emoji].map(c => c.codePointAt(0)!.toString(16).padStart(4, '0')).join('-');
}

async function getEmojiImage(emoji: string): Promise<CanvasImage | null> {
    if (emojiImageCache.has(emoji)) return emojiImageCache.get(emoji)!;
    if (!appleEmojiMap) await loadAppleEmojiMap();
    const base = emojiToUnicode(emoji);
    const variants = [base, base.replace(/-fe0f/gi, ''), `${base.replace(/-fe0f/gi, '')}-fe0f`];
    let b64 = null;
    for (const v of variants) {
        if (appleEmojiMap[v]) { b64 = appleEmojiMap[v]; break; }
    }
    if (!b64) return null;
    const img = await loadImage(Buffer.from(b64, 'base64'));
    emojiImageCache.set(emoji, img);
    return img;
}

function measureTextWithEmojis(ctx: any, text: string, fontSize: number): number {
    const parts = text.split(EMOJI_REGEX);
    return parts.reduce((totalWidth, part) => {
        if (!part) return totalWidth;
        EMOJI_REGEX.lastIndex = 0;
        return totalWidth + (EMOJI_REGEX.test(part) ? fontSize * 1.05 : ctx.measureText(part).width);
    }, 0);
}

async function drawTextWithEmojis(ctx: any, text: string, x: number, y: number, fontSize: number) {
    const parts = text.split(EMOJI_REGEX);
    let currentX = x;
    for (const part of parts) {
        if (!part) continue;
        EMOJI_REGEX.lastIndex = 0;
        if (EMOJI_REGEX.test(part)) {
            const emojiSize = fontSize * 1.05;
            const img = await getEmojiImage(part);
            if (img) {
                ctx.drawImage(img, currentX, y - emojiSize * 0.85, emojiSize, emojiSize);
            } else {
                ctx.fillText(part, currentX, y);
            }
            currentX += emojiSize;
        } else {
            ctx.fillText(part, currentX, y);
            currentX += ctx.measureText(part).width;
        }
    }
}

function wrapText(ctx: any, text: string, maxWidth: number, fontSize: number): string[] {
    ctx.font = `${fontSize}px InterRegular`;
    const lines: string[] = [];
    text.split('\n').forEach(line => {
        let currentLine = '';
        const words = line.split(' ');
        for (const word of words) {
            const testLine = currentLine ? `${currentLine} ${word}` : word;
            if (measureTextWithEmojis(ctx, testLine, fontSize) > maxWidth) {
                lines.push(currentLine);
                currentLine = word;
            } else {
                currentLine = testLine;
            }
        }
        lines.push(currentLine);
    });
    return lines;
}

// --- Main Generator Function ---

export interface WhatsAppParams {
  text: string;
  timeStr: string;
  imgUrl?: string;
  theme?: 'light' | 'dark';
}

export async function generateWhatsApp(params: WhatsAppParams): Promise<Buffer> {
    const { text, timeStr, imgUrl, theme = 'dark' } = params;
    await setupFontsAndAssets();

    const canvas = createCanvas(941, 1671);
    const ctx = canvas.getContext('2d');
    
    // Always load background template
    const bgImg = await loadImage(join(ASSETS_DIR, 'iqc-hytam.png'));
    
    // Draw base
    if (theme === 'light') {
        // Create WhatsApp light background with pattern
        // Base color
        ctx.fillStyle = '#efeae2';
        ctx.fillRect(0, 0, 941, 1671);
        
        // Draw WhatsApp-like pattern (subtle dots/circles)
        ctx.save();
        ctx.globalAlpha = 0.06; // Very subtle pattern
        
        const patternSize = 8;
        const dotSize = 1.5;
        
        for (let y = 0; y < 1671; y += patternSize) {
            for (let x = 0; x < 941; x += patternSize) {
                // Create scattered dot pattern like WhatsApp
                if ((x + y) % 16 === 0) {
                    ctx.fillStyle = '#d1ccc0';
                    ctx.beginPath();
                    ctx.arc(x + patternSize / 2, y + patternSize / 2, dotSize, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }
        
        // Add subtle texture lines
        ctx.globalAlpha = 0.03;
        for (let i = 0; i < 1671; i += 2) {
            ctx.strokeStyle = '#d1ccc0';
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(941, i);
            ctx.stroke();
        }
        
        ctx.restore();
        
        // Draw template elements on top
        ctx.save();
        ctx.globalAlpha = 0.15; // Make template very subtle (just for UI elements)
        ctx.drawImage(bgImg, 0, 0, 941, 1671);
        ctx.restore();
    } else {
        // Dark mode: just draw original template
        ctx.drawImage(bgImg, 0, 0, 941, 1671);
    }

    // Theme colors - only for user-generated content
    const colors = theme === 'light'
        ? { 
            statusBar: '#000000', 
            bubble: '#d9fdd3', // Light green bubble
            text: '#303030', // Dark text for readability
            time: '#667781', 
            reactionBar: 'rgba(255, 255, 255, 0.9)', // More solid for better visibility
            reactionBorder: 'rgba(0, 0, 0, 0.1)',
            plusIcon: '#8696a0'
          }
        : { 
            statusBar: '#ffffff', 
            bubble: '#1c1c1e', 
            text: '#ffffff', 
            time: '#727278', 
            reactionBar: '#1c1c1e',
            reactionBorder: 'transparent',
            plusIcon: '#8e8e93'
          };

    ctx.fillStyle = colors.statusBar;
    ctx.font = `27px InterRegular`;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(timeStr || '12.00', 463, 8);

    const chatFontSize = 30;
    const maxWidthLimit = 530;
    const minBubbleWidth = 280;
    const lineHeight = chatFontSize + 14;
    const paddingX = 30;
    const paddingY = 20;
    const rad = 28;
    const fixedX = 35;
    const fixedBaseY = 946;

    let bubbleW: number, finalBubbleHeight: number, finalY: number;

    const drawBubble = (x: number, y: number, w: number, h: number) => {
        ctx.save();
        
        // Add shadow for light mode to create depth
        if (theme === 'light') {
            ctx.shadowColor = 'rgba(0, 0, 0, 0.08)';
            ctx.shadowBlur = 8;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 2;
        }
        
        ctx.fillStyle = colors.bubble;
        ctx.beginPath();
        ctx.moveTo(x + rad, y);
        ctx.lineTo(x + w - rad, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + rad);
        ctx.lineTo(x + w, y + h - rad);
        ctx.quadraticCurveTo(x + w, y + h, x + w - rad, y + h);
        ctx.lineTo(x + rad, y + h);
        ctx.quadraticCurveTo(x + 8, y + h, x + 8, y + h - 8);
        ctx.lineTo(x + 8, y + rad);
        ctx.quadraticCurveTo(x + 8, y, x + rad, y);
        ctx.closePath();
        ctx.fill();
        
        // Tail with same shadow
        ctx.beginPath();
        ctx.moveTo(x + 12, y + h - 20);
        ctx.quadraticCurveTo(x - 2, y + h - 4, x - 8, y + h);
        ctx.quadraticCurveTo(x + 6, y + h, x + 22, y + h - 2);
        ctx.closePath();
        ctx.fill();
        
        ctx.restore(); // This resets shadow completely
    };

    if (imgUrl) {
        const imgBuf = imgUrl.startsWith('http') ? (await axios.get(imgUrl, { responseType: 'arraybuffer' })).data : Buffer.from(imgUrl.split(',')[1], 'base64');
        const imgObj = await loadImage(imgBuf);

        const imgAspect = imgObj.width / imgObj.height;
        bubbleW = Math.min(Math.max(imgObj.width, minBubbleWidth), maxWidthLimit);
        let imgDrawH = Math.round(bubbleW / imgAspect);
        ctx.font = `22px InterRegular`;
        const timeWidth = ctx.measureText(timeStr || '12.00').width;
        bubbleW = Math.max(bubbleW, timeWidth + 75);

        const captionLines = text ? wrapText(ctx, text, bubbleW - paddingX * 2, chatFontSize) : [];
        const captionH = captionLines.length > 0 ? paddingY + (captionLines.length * lineHeight) : 0;
        const timeRowH = 28;

        finalBubbleHeight = imgDrawH + captionH + timeRowH + (captionLines.length > 0 ? 4 : 0);
        finalY = fixedBaseY - finalBubbleHeight;

        drawBubble(fixedX, finalY, bubbleW, finalBubbleHeight);

        // Draw Image inside bubble
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(fixedX + rad, finalY);
        ctx.lineTo(fixedX + bubbleW - rad, finalY);
        ctx.quadraticCurveTo(fixedX + bubbleW, finalY, fixedX + bubbleW, finalY + rad);
        ctx.lineTo(fixedX + bubbleW, finalY + imgDrawH);
        ctx.lineTo(fixedX, finalY + imgDrawH);
        ctx.lineTo(fixedX, finalY + rad);
        ctx.quadraticCurveTo(fixedX, finalY, fixedX + rad, finalY);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(imgObj, fixedX, finalY, bubbleW, imgDrawH);
        ctx.restore();

        // Draw caption
        if (captionLines.length > 0) {
            ctx.save();
            ctx.fillStyle = colors.text;
            ctx.font = `${chatFontSize}px InterRegular`;
            ctx.textAlign = "left";
            ctx.textBaseline = "top";
            for (let i = 0; i < captionLines.length; i++) {
                const lineY = finalY + imgDrawH + paddingY + (i * lineHeight);
                await drawTextWithEmojis(ctx, captionLines[i].trim(), fixedX + paddingX, lineY, chatFontSize);
            }
            ctx.restore();
        }

        // Draw time
        ctx.save();
        ctx.fillStyle = colors.time;
        ctx.font = `22px InterRegular`;
        ctx.textAlign = "right";
        ctx.textBaseline = "middle";
        ctx.fillText(timeStr || '12.00', fixedX + bubbleW - 22, finalY + finalBubbleHeight - timeRowH);
        ctx.restore();

    } else { // Text only
        const chatLines = wrapText(ctx, text || ' ', maxWidthLimit, chatFontSize);
        let longestW = 0;
        chatLines.forEach(l => {
            const w = measureTextWithEmojis(ctx, l.trim(), chatFontSize);
            if (w > longestW) longestW = w;
        });

        bubbleW = longestW + (paddingX * 2);
        ctx.font = `22px InterRegular`;
        const timeWidth = ctx.measureText(timeStr || '12.00').width;
        bubbleW = Math.max(bubbleW, timeWidth + 75, 180);

        const spaceTimeY = 12;
        finalBubbleHeight = (chatLines.length * lineHeight) + paddingY + spaceTimeY + 22;
        finalY = fixedBaseY - finalBubbleHeight;

        drawBubble(fixedX, finalY, bubbleW, finalBubbleHeight);

        // Draw text
        ctx.save();
        ctx.fillStyle = colors.text;
        ctx.font = `${chatFontSize}px InterRegular`;
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        for (let i = 0; i < chatLines.length; i++) {
            const lineY = finalY + paddingY + (i * lineHeight);
            await drawTextWithEmojis(ctx, chatLines[i].trim(), fixedX + paddingX, lineY, chatFontSize);
        }
        ctx.restore();

        // Draw time
        ctx.save();
        ctx.fillStyle = colors.time;
        ctx.font = `22px InterRegular`;
        ctx.textAlign = "right";
        ctx.textBaseline = "top";
        ctx.fillText(timeStr || '12.00', fixedX + bubbleW - 22, finalY + finalBubbleHeight - 38);
        ctx.restore();
    }

    // --- Emoji Reaction Bar ---
    const emojis = ["👍", "❤️", "😂", "😮", "😢", "🙏"];
    const emojiSize = 54;
    const emCardH = emojiSize + 44;
    const emCardW = 530;
    const emCardX = fixedX + 8;
    const emCardY = finalY - emCardH - 18;

    // Draw reaction bar with glass effect for light mode
    ctx.save();
    ctx.fillStyle = colors.reactionBar;
    ctx.beginPath();
    ctx.roundRect(emCardX, emCardY, emCardW, emCardH, [emCardH / 2]);
    ctx.fill();
    
    // Add subtle border for light mode glass effect
    if (theme === 'light' && colors.reactionBorder) {
        ctx.strokeStyle = colors.reactionBorder;
        ctx.lineWidth = 1.5;
        ctx.stroke();
    }
    ctx.restore();

    const startX = emCardX + 55;
    const spacingX = 76;
    const emojiCY = emCardY + (emCardH / 2);

    for (let i = 0; i < Math.min(emojis.length, 6); i++) {
        const emoji = emojis[i];
        const emojiImg = await getEmojiImage(emoji);
        if (emojiImg) {
            ctx.drawImage(emojiImg, startX + (i * spacingX) - (emojiSize / 2), emojiCY - (emojiSize / 2), emojiSize, emojiSize);
        }
    }

    ctx.fillStyle = colors.plusIcon;
    ctx.font = `36px InterRegular`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("+", startX + (6 * spacingX) - 8, emCardY + (emCardH / 2) - 2);
    // -------------------------

    return await canvas.encode('png');
}