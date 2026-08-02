import { createCanvas, loadImage, GlobalFonts } from '@napi-rs/canvas';
import { writeFile, mkdir } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import axios from 'axios';

async function downloadAsset(url: string, localPath: string) {
    if (!existsSync(localPath)) {
        try {
            const response = await axios.get(url, { responseType: 'arraybuffer' });
            await writeFile(localPath, Buffer.from(response.data));
        } catch (error) {
            console.error(`Failed to download asset from ${url}:`, error);
            throw new Error(`Failed to download asset: ${url}`);
        }
    }
}

export async function generateFakeCall(nama: string, durasi: string, avatarSrc: string) {
    try {
        const ASSETS_DIR = join(process.cwd(), 'assets', 'fakecall_ios');
        const FONTS_DIR = join(ASSETS_DIR, 'fonts');
        const BG_LOCAL = join(ASSETS_DIR, 'template_call.png');

        await mkdir(FONTS_DIR, { recursive: true });

        const BG_URL = 'https://raw.githubusercontent.com/ryyntwx/allimagerin/refs/heads/main/353dc125-a39c-4d27-9ba5-9ec7dfa6624a.png';
        await downloadAsset(BG_URL, BG_LOCAL);

        const fontConfigs = [
            { url: 'https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmWUlfBBc4AMP6lQ.woff2', name: 'Roboto-Bold.ttf', family: 'RobotoWA' },
            { url: 'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxKKTU1Kg.woff2', name: 'Roboto-Regular.ttf', family: 'RobotoWA' }
        ];

        for (const f of fontConfigs) {
            const fPath = join(FONTS_DIR, f.name);
            await downloadAsset(f.url, fPath);
            if (!GlobalFonts.has(f.family)) {
                GlobalFonts.registerFromPath(fPath, f.family);
            }
        }

        const APPLE_EMOJI_JSON_URL = 'https://media.githubusercontent.com/media/Ditzzx-vibecoder/entahlah/main/emoji-apple.json';
        const APPLE_EMOJI_JSON_LOCAL = join(FONTS_DIR, 'emoji-apple-image.json');
        await downloadAsset(APPLE_EMOJI_JSON_URL, APPLE_EMOJI_JSON_LOCAL);

        const appleEmojiMap = JSON.parse(readFileSync(APPLE_EMOJI_JSON_LOCAL, 'utf-8'));
        const emojiCache = new Map();

        let avatarBuffer;
        if (avatarSrc.startsWith('http')) {
            const response = await axios.get(avatarSrc, { responseType: 'arraybuffer' });
            avatarBuffer = Buffer.from(response.data);
        } else {
            avatarBuffer = Buffer.from(avatarSrc.split(',')[1], 'base64');
        }

        const avImg = await loadImage(avatarBuffer);
        const bgImg = await loadImage(BG_LOCAL);

        const canvas = createCanvas(bgImg.width, bgImg.height);
        const ctx = canvas.getContext('2d');

        ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

        const ppX = canvas.width / 2;
        const ppY = canvas.height * 0.50;
        const ppRadius = canvas.width * 0.22;

        ctx.save();
        ctx.beginPath();
        ctx.arc(ppX, ppY, ppRadius, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avImg, ppX - ppRadius, ppY - ppRadius, ppRadius * 2, ppRadius * 2);
        ctx.restore();

        const EMOJI_DETECTOR = /(\p{Emoji_Presentation}|\p{Extended_Pictographic})/u;
        function emojiToUnicode(emoji: string) {
            return [...emoji].map(c => c.codePointAt(0)!.toString(16).padStart(4, '0')).join('-');
        }

        async function getEmojiImage(emoji: string) {
            if (emojiCache.has(emoji)) return emojiCache.get(emoji);
            const base = emojiToUnicode(emoji);
            const variants = [base, base.replace(/-fe0f/gi, ''), `${base.replace(/-fe0f/gi, '')}-fe0f`];
            let b64 = null;
            for (const v of variants) {
                if (appleEmojiMap[v]) { b64 = appleEmojiMap[v]; break; }
            }
            if (!b64) return null;
            const img = await loadImage(Buffer.from(b64, 'base64'));
            emojiCache.set(emoji, img);
            return img;
        }

        function parseTextAndEmojis(textStr: string) {
            const tokens: { type: 'text' | 'emoji', value: string }[] = [];
            const chars = [...textStr];
            let currentText = "";
            for (let i = 0; i < chars.length; i++) {
                if (EMOJI_DETECTOR.test(chars[i])) {
                    if (currentText) tokens.push({ type: 'text', value: currentText });
                    currentText = "";
                    let emojiVal = chars[i];
                    if (chars[i + 1] === '️') { emojiVal += chars[i + 1]; i++; }
                    tokens.push({ type: 'emoji', value: emojiVal });
                } else {
                    currentText += chars[i];
                }
            }
            if (currentText) tokens.push({ type: 'text', value: currentText });
            return tokens;
        }

        function measureTextCustom(context: any, tokens: any[], fontSize: number) {
            let totalWidth = 0;
            for (const token of tokens) {
                if (token.type === 'emoji') totalWidth += fontSize * 1.05;
                else totalWidth += context.measureText(token.value).width;
            }
            return totalWidth;
        }

        async function drawTextWithEmojisCenter(context: any, textStr: string, yPos: number, fontSize: number, fontString: string) {
            context.font = fontString;
            context.textBaseline = 'top';
            const tokens = parseTextAndEmojis(textStr);
            const totalWidth = measureTextCustom(context, tokens, fontSize);
            let currentX = (canvas.width / 2) - (totalWidth / 2);
            for (const token of tokens) {
                if (token.type === 'emoji') {
                    const emojiSize = fontSize * 1.05;
                    const img = await getEmojiImage(token.value);
                    if (img) context.drawImage(img, currentX, yPos + (fontSize - emojiSize) / 2, emojiSize, emojiSize);
                    else context.fillText(token.value, currentX, yPos);
                    currentX += emojiSize;
                } else {
                    context.fillText(token.value, currentX, yPos);
                    currentX += context.measureText(token.value).width;
                }
            }
        }

        ctx.fillStyle = '#FFFFFF';
        await drawTextWithEmojisCenter(ctx, nama, 75, 42, `700 42px RobotoWA, sans-serif`);

        ctx.fillStyle = '#C5C5C5';
        await drawTextWithEmojisCenter(ctx, durasi, 133, 35, `400 35px RobotoWA, sans-serif`);

        return canvas.toBuffer('image/png');

    } catch (error) {
        console.error("Error generating fake call image:", error);
        throw error;
    }
}
