import { NextResponse } from 'next/server';
import { generateFakeFF } from '../../../../lib/generators/fakeff';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nickname } = body;

    if (!nickname) {
      return NextResponse.json({ error: 'Missing required nickname field' }, { status: 400 });
    }

    const imageBuffer = await generateFakeFF(nickname);

    const base64Image = imageBuffer.toString('base64');
    const dataUrl = `data:image/png;base64,${base64Image}`;

    return NextResponse.json({ image: dataUrl });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message || 'Failed to generate Fake FF image' }, { status: 500 });
  }
}
