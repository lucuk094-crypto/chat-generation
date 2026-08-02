import { NextResponse } from 'next/server';
import { generateBeautifulMeme } from '../../../../lib/generators/beautifulmeme';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { image1, image2 } = body;

    if (!image1 || !image2) {
      return NextResponse.json({ error: 'Missing required fields: image1 and image2' }, { status: 400 });
    }

    const imageBuffer = await generateBeautifulMeme(image1, image2);

    const base64Image = imageBuffer.toString('base64');
    const dataUrl = `data:image/png;base64,${base64Image}`;

    return NextResponse.json({ image: dataUrl });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message || 'Failed to generate Beautiful Meme' }, { status: 500 });
  }
}
