import { createCanvas, loadImage } from '@napi-rs/canvas';
import { fetchBuffer, setupFont, getCachedFile, drawRoundedRect, drawCircleImage } from '../utils-canvas';

const TEMPLATE_URL = 'https://raw.githubusercontent.com/Ditzzx-vibecoder/Assets/main/ttqc/qyzwa.png';

const FONT_ASSETS = [
  { name: 'PlusJakartaSans-Regular.ttf', url: 'https://raw.githubusercontent.com/Ditzzx-vibecoder/Assets/main/ttqc/PlusJakartaSans-Regular.ttf', family: 'Plus Jakarta Sans' },
  { name: 'PlusJakartaSans-Medium.ttf', url: 'https://raw.githubusercontent.com/Ditzzx-vibecoder/Assets/main/ttqc/PlusJakartaSans-Medium.ttf', family: 'Plus Jakarta Sans' },
  { name: 'PlusJakartaSans-Bold.ttf', url: 'https://raw.githubusercontent.com/Ditzzx-vibecoder/Assets/main/ttqc/PlusJakartaSans-Bold.ttf', family: 'Plus Jakarta Sans' },
  { name: 'fa-solid-900.ttf', url: 'https://raw.githubusercontent.com/Ditzzx-vibecoder/Assets/main/ttqc/fa-solid-900.ttf', family: 'Font Awesome 6 Free' },
  { name: 'NotoColorEmoji.ttf', url: 'https://github.com/googlefonts/noto-emoji/raw/main/fonts/NotoColorEmoji.ttf', family: 'Noto Color Emoji' },
];

const MENU_ICONS = [
  { unicode: '\uf3e5', text: 'Balas', color: '#000000' },
  { unicode: '\uf064', text: 'Teruskan', color: '#000000' },
  { unicode: '\uf0c5', text: 'Salin', color: '#000000' },
  { unicode: '\uf1ab', text: 'Terjemahkan', color: '#000000' },
  { unicode: '\uf2ed', text: 'Hapus untuk saya', color: '#000000' },
  { unicode: '\uf024', text: 'Laporkan', color: '#ea4335' },
];

const config = {
  topPPX: 183, topPPY: 83, topPPRadius: 42,
  topNameX: 250, topNameY: 82, topNameSize: 34,
  chatPPX: 75, chatPPRadius: 38,
  textX: 175, textY: 962,
  bubbleWidth: 520, textSize: 30,
  bubbleBgColor: '#ffffff', textColor: '#161823',
};

function wrapText(ctx: any, text: string, maxWidth: number) {
  const words = text.split(/(\s+)/);
  const lines = [];
  let currentLine = '';

  for (const word of words) {
    if (!word) continue;
    if (word.trim() === '' && currentLine === '') continue;

    const testLine = currentLine + word;
    if (ctx.measureText(testLine).width > maxWidth) {
      if (currentLine !== '') {
        lines.push(currentLine.trimEnd());
        currentLine = word.trimStart();
      } else {
        lines.push(testLine);
        currentLine = '';
      }
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine.trim()) {
    lines.push(currentLine.trimEnd());
  }
  return lines;
}

export interface TiktokParams {
  username: string;
  chatText: string;
  avatarSrc: string;
  theme?: 'light' | 'dark';
}

export async function generateTiktok(params: TiktokParams): Promise<Buffer> {
  const { username, chatText, avatarSrc, theme = 'light' } = params;

  for (const font of FONT_ASSETS) {
    await setupFont(font.name, font.url, font.family);
  }

  const templatePath = await getCachedFile('tt_template.png', TEMPLATE_URL);
  const templateImage = await loadImage(templatePath);
  
  let avatarImage;
  try {
    const avatarBuf = await fetchBuffer(avatarSrc);
    avatarImage = await loadImage(avatarBuf);
  } catch (e) {
    // fallback if avatar fetch fails
    const fallbackBuf = await fetchBuffer('https://raw.githubusercontent.com/Ditzzx-vibecoder/Assets/6b71d84a580f385bd7ee36402df5341ead4770a0/Image/artworks-gWLRE6HyPH3DgVMG-ZFFxtg-t500x500.jpg');
    avatarImage = await loadImage(fallbackBuf);
  }

  const canvas = createCanvas(1080 * 2, 2280 * 2);
  const ctx = canvas.getContext('2d');

  ctx.scale(2, 2);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  ctx.clearRect(0, 0, 1080, 2280);
  
  // Always draw template first
  ctx.drawImage(templateImage, 0, 0, 1080, 2280);
  
  // Apply dark overlay if dark mode (preserve UI elements)
  if (theme === 'dark') {
    ctx.save();
    // Create a dark overlay on background areas only
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillRect(0, 0, 1080, 2280);
    ctx.restore();
  }

  // Theme colors
  const colors = theme === 'dark' 
    ? { topName: '#ffffff', bubble: '#1c1c1e', text: '#ffffff', menuBg: '#1c1c1e', menuText: '#ffffff', menuBorder: 'rgba(255,255,255,0.1)' }
    : { topName: '#000000', bubble: '#ffffff', text: '#161823', menuBg: '#ffffff', menuText: '#000000', menuBorder: 'rgba(0,0,0,0.02)' };

  drawCircleImage(ctx, avatarImage, config.topPPX, config.topPPY, config.topPPRadius);

  ctx.font = `bold ${config.topNameSize}px 'Plus Jakarta Sans', 'Noto Color Emoji'`;
  ctx.fillStyle = colors.topName;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(username, config.topNameX, config.topNameY);

  ctx.font = `500 ${config.textSize}px 'Plus Jakarta Sans', 'Noto Color Emoji'`;
  
  const lines = wrapText(ctx, chatText, config.bubbleWidth - 52);
  const lineH = config.textSize * 1.45;

  let maxW = 0;
  for (const l of lines) {
    const w = ctx.measureText(l).width;
    if (w > maxW) maxW = w;
  }

  const padX = 30, padY = 24;
  const bubbleW = Math.max(maxW + padX * 2, 180);
  const bubbleH = lines.length * lineH + padY * 2;
  const bubbleX = config.textX - padX;
  const bubbleY = config.textY - padY;

  drawCircleImage(ctx, avatarImage, config.chatPPX, bubbleY + bubbleH / 2, config.chatPPRadius);
  drawRoundedRect(ctx, bubbleX, bubbleY, bubbleW, bubbleH, 35, colors.bubble);

  ctx.fillStyle = colors.text;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';

  lines.forEach((line, i) => {
    const lineY = config.textY + i * lineH + config.textSize / 2;
    ctx.fillText(line, config.textX, lineY);
  });

  const menuX = 90, menuY = bubbleY + bubbleH + 28;
  drawRoundedRect(ctx, menuX, menuY, 565, 580, 40, colors.menuBg, colors.menuBorder, true);

  const itemH = 90, iconX = menuX + 60, labelX = menuX + 130;
  MENU_ICONS.forEach((item, i) => {
    const cy = menuY + 25 + i * itemH + itemH / 2;
    const iconColor = item.text === 'Laporkan' ? '#ea4335' : colors.menuText;
    ctx.fillStyle = iconColor;
    ctx.font = `900 34px 'Font Awesome 6 Free'`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(item.unicode, iconX, cy);
    ctx.font = `500 34px 'Plus Jakarta Sans'`;
    ctx.fillStyle = item.text === 'Laporkan' ? '#ea4335' : colors.menuText;
    ctx.textAlign = 'left';
    ctx.fillText(item.text, labelX, cy);
  });

  ctx.restore();

  return await canvas.encode('png');
}
