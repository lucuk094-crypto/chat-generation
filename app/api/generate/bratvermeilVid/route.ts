import { NextResponse } from 'next/server';
import { generateBratVermeilVideo } from '../../../../lib/generators/bratvermeilVid';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text } = body;

    if (!text) {
      return NextResponse.json({ error: 'Missing required text field' }, { status: 400 });
    }

    const videoBuffer = await generateBratVermeilVideo(text);

    const base64Video = videoBuffer.toString('base64');
    const dataUrl = `data:video/mp4;base64,${base64Video}`;

    return NextResponse.json({ image: dataUrl });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message || 'Failed to generate video' }, { status: 500 });
  }
}
