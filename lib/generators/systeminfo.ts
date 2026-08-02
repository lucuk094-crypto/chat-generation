import { createCanvas, GlobalFonts } from '@napi-rs/canvas';
import { writeFile, mkdir } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import os from 'node:os';
import axios from 'axios';

const COLORS = {
  bg: '#0c0e11',
  panel: '#14171b',
  panelAlt: '#191d22',
  line: '#262b31',
  lineSoft: '#1e2227',
  text: '#e6e9ec',
  textDim: '#8a9199',
  textFaint: '#767e8a',
  amber: '#c9974f',
  green: '#6fa578',
  red: '#b8664f',
  blue: '#6d8fa8'
};

const ASSETS_DIR = join(process.cwd(), 'assets', 'system-info');
const FONTS_DIR = join(ASSETS_DIR, 'fonts');

let fontSans = 'sans-serif';
let fontSansBold = 'sans-serif';
let fontMono = 'monospace';

async function prepareAssets() {
  await mkdir(FONTS_DIR, { recursive: true });

  const fonts = [
    { family: 'Inter', url: 'https://cdn.jsdelivr.net/gh/rsms/inter@v4.0/docs/font-files/Inter-Regular.woff2', localName: 'Inter-Regular.woff2' },
    { family: 'Inter-Bold', url: 'https://cdn.jsdelivr.net/gh/rsms/inter@v4.0/docs/font-files/Inter-Bold.woff2', localName: 'Inter-Bold.woff2' },
    { family: 'JetBrainsMono', url: 'https://cdn.jsdelivr.net/npm/@fontsource/ibm-plex-mono@latest/files/ibm-plex-mono-latin-400-normal.woff2', localName: 'IBMPlexMono-Regular.woff2' }
  ];

  const loaded: Record<string, boolean> = {};
  
  for (const font of fonts) {
    const fontLocal = join(FONTS_DIR, font.localName);
    try {
      if (!existsSync(fontLocal)) {
        const res = await axios.get(font.url, {
          responseType: 'arraybuffer',
          headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        await writeFile(fontLocal, Buffer.from(res.data));
      }
      if (!GlobalFonts.has(font.family)) {
        GlobalFonts.registerFromPath(fontLocal, font.family);
      }
      loaded[font.family] = true;
    } catch (e) {
      console.error('Font failed:', font.family);
      loaded[font.family] = false;
    }
  }

  return loaded;
}

function getMemInfo() {
  const total = os.totalmem();
  const free = os.freemem();
  const used = total - free;
  return {
    total,
    free,
    used,
    usedPercent: (used / total) * 100
  };
}

function getCpuInfo() {
  const cpus = os.cpus();
  return {
    model: cpus.length ? cpus[0].model.trim() : 'Unknown CPU',
    cores: cpus.length,
    loadavg: os.loadavg()
  };
}

function getNetworkInfo() {
  const ifaces = os.networkInterfaces();
  const list: Array<{name: string, address: string, family: string}> = [];
  for (const [name, addrs] of Object.entries(ifaces)) {
    for (const addr of (addrs || [])) {
      if (!addr.internal) {
        list.push({ 
          name, 
          address: addr.address, 
          family: String(addr.family) 
        });
      }
    }
  }
  return list;
}

function formatBytes(bytes: number | null) {
  if (bytes == null || isNaN(bytes)) return 'n/a';
  const gb = bytes / (1024 ** 3);
  if (gb >= 1) return gb.toFixed(1) + ' GB';
  const mb = bytes / (1024 ** 2);
  return mb.toFixed(0) + ' MB';
}

function formatUptime(seconds: number) {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${d}d ${h}h ${m}m`;
}

function roundRect(ctx: any, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawPanel(ctx: any, x: number, y: number, w: number, h: number) {
  roundRect(ctx, x, y, w, h, 6);
  ctx.fillStyle = COLORS.panel;
  ctx.fill();
  ctx.strokeStyle = COLORS.line;
  ctx.lineWidth = 1;
  ctx.stroke();
}

function drawBar(ctx: any, x: number, y: number, w: number, percent: number, color: string) {
  roundRect(ctx, x, y, w, 12, 3);
  ctx.fillStyle = COLORS.lineSoft;
  ctx.fill();
  ctx.strokeStyle = COLORS.line;
  ctx.stroke();

  const fillW = Math.max(2, (Math.min(percent, 100) / 100) * w);
  roundRect(ctx, x, y, fillW, 12, 3);
  ctx.fillStyle = color;
  ctx.fill();
}

function drawRow(ctx: any, x: number, y: number, w: number, label: string, value: string) {
  ctx.font = `13px ${fontSans}`;
  ctx.fillStyle = COLORS.textDim;
  ctx.textAlign = 'left';
  ctx.fillText(label, x, y);
  
  ctx.font = `13px ${fontMono}`;
  ctx.fillStyle = COLORS.text;
  ctx.textAlign = 'right';
  ctx.fillText(value, x + w, y);
  ctx.textAlign = 'left';
}

export async function generateSystemInfo(): Promise<Buffer> {
  try {
    // Prepare fonts
    const loaded = await prepareAssets();
    fontSans = loaded['Inter'] ? 'Inter' : 'sans-serif';
    fontSansBold = loaded['Inter-Bold'] ? 'Inter-Bold' : 'sans-serif';
    fontMono = loaded['JetBrainsMono'] ? 'JetBrainsMono' : 'monospace';

    // Collect system data
    const mem = getMemInfo();
    const cpu = getCpuInfo();
    const net = getNetworkInfo();
    const hostname = os.hostname();
    const platform = os.platform();
    const arch = os.arch();
    const uptime = os.uptime();

    // Create canvas
    const WIDTH = 1080;
    const HEIGHT = 720;
    const canvas = createCanvas(WIDTH, HEIGHT);
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = COLORS.bg;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    const marginX = 30;
    let cy = 40;

    // Header
    ctx.font = `11px ${fontSans}`;
    ctx.fillStyle = COLORS.textFaint;
    ctx.fillText('SYSTEM REPORT / RUNTIME PROBE', marginX, cy);

    cy += 30;
    ctx.font = `26px ${fontSansBold}`;
    ctx.fillStyle = COLORS.text;
    ctx.fillText(hostname, marginX, cy);

    cy += 22;
    ctx.font = `13px ${fontMono}`;
    ctx.fillStyle = COLORS.textDim;
    ctx.fillText(`${platform} ${arch} - uptime ${formatUptime(uptime)}`, marginX, cy);

    cy += 30;

    // Stats cards
    const stripW = (WIDTH - marginX * 2 - 42) / 3;
    const stripH = 90;

    const stats = [
      { label: 'CPU CORES', value: String(cpu.cores), unit: 'threads', caption: `load ${cpu.loadavg[0].toFixed(2)}` },
      { label: 'MEMORY', value: formatBytes(mem.total).split(' ')[0], unit: formatBytes(mem.total).split(' ')[1], caption: `${mem.usedPercent.toFixed(1)}% used` },
      { label: 'NETWORK', value: String(net.length), unit: 'interfaces', caption: platform }
    ];

    stats.forEach((s, i) => {
      const x = marginX + i * (stripW + 21);
      drawPanel(ctx, x, cy, stripW, stripH);

      ctx.font = `11px ${fontSans}`;
      ctx.fillStyle = COLORS.textFaint;
      ctx.fillText(s.label, x + 16, cy + 26);

      ctx.font = `22px ${fontSansBold}`;
      ctx.fillStyle = COLORS.text;
      ctx.fillText(s.value, x + 16, cy + 54);

      const vw = ctx.measureText(s.value).width;
      ctx.font = `13px ${fontSans}`;
      ctx.fillStyle = COLORS.textDim;
      ctx.fillText(s.unit, x + 16 + vw + 5, cy + 54);

      ctx.font = `11px ${fontMono}`;
      ctx.fillStyle = COLORS.textFaint;
      ctx.fillText(s.caption, x + 16, cy + 74);
    });

    cy += stripH + 24;

    // Detail cards
    const colW = (WIDTH - marginX * 2 - 14) / 2;
    const cardH = 200;

    // CPU Card
    drawPanel(ctx, marginX, cy, colW, cardH);
    ctx.font = `15px ${fontSansBold}`;
    ctx.fillStyle = COLORS.text;
    ctx.fillText('Processor', marginX + 20, cy + 24);

    let ry = cy + 50;
    const cpuModel = cpu.model.length > 34 ? cpu.model.slice(0, 34) + '…' : cpu.model;
    drawRow(ctx, marginX + 20, ry, colW - 40, 'Model', cpuModel); ry += 24;
    drawRow(ctx, marginX + 20, ry, colW - 40, 'Cores', String(cpu.cores)); ry += 24;
    drawRow(ctx, marginX + 20, ry, colW - 40, 'Load avg', cpu.loadavg.map(v => v.toFixed(2)).join(' / ')); ry += 30;

    drawBar(ctx, marginX + 20, ry, colW - 40, Math.min(100, (cpu.loadavg[0] / cpu.cores) * 100), COLORS.blue);

    // Memory Card
    const rightX = marginX + colW + 14;
    drawPanel(ctx, rightX, cy, colW, cardH);
    ctx.font = `15px ${fontSansBold}`;
    ctx.fillStyle = COLORS.text;
    ctx.fillText('Memory', rightX + 20, cy + 24);

    ry = cy + 50;
    drawRow(ctx, rightX + 20, ry, colW - 40, 'Total', formatBytes(mem.total)); ry += 24;
    drawRow(ctx, rightX + 20, ry, colW - 40, 'Used', formatBytes(mem.used)); ry += 24;
    drawRow(ctx, rightX + 20, ry, colW - 40, 'Free', formatBytes(mem.free)); ry += 30;

    drawBar(ctx, rightX + 20, ry, colW - 40, mem.usedPercent, COLORS.green);

    cy += cardH + 20;

    // Network Card
    const netH = 180;
    drawPanel(ctx, marginX, cy, WIDTH - marginX * 2, netH);
    ctx.font = `15px ${fontSansBold}`;
    ctx.fillStyle = COLORS.text;
    ctx.fillText('Network Interfaces', marginX + 20, cy + 24);

    ry = cy + 50;
    if (net.length) {
      net.slice(0, 5).forEach((n) => {
        let maskedIp = n.address;
        if (n.family === 'IPv4' || n.family === '4') {
          const parts = n.address.split('.');
          maskedIp = parts.length === 4 ? `${parts[0]}.${parts[1]}.x.x` : 'x.x.x.x';
        }
        drawRow(ctx, marginX + 20, ry, WIDTH - marginX * 2 - 40, n.name, `${maskedIp} (${n.family})`);
        ry += 24;
      });
    } else {
      ctx.font = `12px ${fontSans}`;
      ctx.fillStyle = COLORS.textFaint;
      ctx.fillText('No external interfaces detected', marginX + 20, ry);
    }

    // Footer
    cy = HEIGHT - 30;
    ctx.font = `11px ${fontMono}`;
    ctx.fillStyle = COLORS.textFaint;
    ctx.fillText(`Generated: ${new Date().toISOString().slice(0, 19).replace('T', ' ')}`, marginX, cy);

    // Return buffer
    const buffer = await canvas.encode('png');
    return buffer;

  } catch (error: any) {
    console.error('Failed to generate System Info:', error);
    throw new Error(error.message || 'Failed to generate System Info');
  }
}
