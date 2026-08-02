import { NextResponse } from 'next/server';
import { generateBratGojo } from '../../../../lib/generators/bratGojo';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text } = body;

    if (!text) {
      return NextResponse.json({ error: 'Missing required text field' }, { status: 400 });
    }

    const imageBuffer = await generateBratGojo(text);

    const base64Image = imageBuffer.toString('base64');
    const dataUrl = `data:image/png;base64,${base64Image}`;

    return NextResponse.json({ image: dataUrl });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message || 'Failed to generate image' }, { status: 500 });
  }
}
