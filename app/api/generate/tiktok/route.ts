import { NextRequest, NextResponse } from 'next/server';
import { generateTiktok } from '@/lib/generators/tiktok';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, chatText, avatarSrc, theme } = body;

    if (!username || !chatText || !avatarSrc) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const buffer = await generateTiktok({ username, chatText, avatarSrc, theme });
    const base64 = buffer.toString('base64');

    return NextResponse.json({ image: `data:image/png;base64,${base64}` });
  } catch (error: any) {
    console.error('TikTok Generator Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
