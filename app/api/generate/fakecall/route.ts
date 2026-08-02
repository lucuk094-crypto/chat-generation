import { NextResponse } from 'next/server';
import { generateFakeCall } from '../../../../lib/generators/fakecall';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nama, durasi, avatarSrc } = body;

    if (!nama || !durasi || !avatarSrc) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const imageBuffer = await generateFakeCall(nama, durasi, avatarSrc);

    const base64Image = imageBuffer.toString('base64');
    const dataUrl = `data:image/png;base64,${base64Image}`;

    return NextResponse.json({ image: dataUrl });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message || 'Failed to generate image' }, { status: 500 });
  }
}
