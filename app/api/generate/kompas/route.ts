import { NextRequest, NextResponse } from 'next/server';
import { generateKompas } from '@/lib/generators/kompas';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { newsText, photoSrc } = body;

    if (!newsText || !photoSrc) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const buffer = await generateKompas({ newsText, photoSrc });
    const base64 = buffer.toString('base64');

    return NextResponse.json({ image: `data:image/png;base64,${base64}` });
  } catch (error: any) {
    console.error('Kompas Generator Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
