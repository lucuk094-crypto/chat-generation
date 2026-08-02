import { NextRequest, NextResponse } from 'next/server';
import { generateWhatsApp } from '@/lib/generators/whatsapp';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, timeStr, imgUrl, theme } = body;

    if (!text || !timeStr) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const buffer = await generateWhatsApp({ text, timeStr, imgUrl, theme });
    const base64 = buffer.toString('base64');

    return NextResponse.json({ image: `data:image/png;base64,${base64}` });
  } catch (error: any) {
    console.error('WhatsApp Generator Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
