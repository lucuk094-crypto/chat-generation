import { NextRequest, NextResponse } from 'next/server';
import { generateIgStory } from '@/lib/generators/igstory';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { photoSrc, ppSrc, nama, username, theme } = body;

    if (!photoSrc || !ppSrc || !nama || !username) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const buffer = await generateIgStory({ photoSrc, ppSrc, nama, username, theme });
    const base64 = buffer.toString('base64');

    return NextResponse.json({ image: `data:image/png;base64,${base64}` });
  } catch (error: any) {
    console.error('IG Story Generator Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
