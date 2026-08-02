import { NextResponse } from 'next/server';
import { generateBratVermeilVideo } from '../../../../lib/generators/bratvermeilVid';

// Set max duration for video generation
export const maxDuration = 60;

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
    console.error('BratVermeilVid Error:', error);
    const errorMessage = error.message || 'Failed to generate video';
    return NextResponse.json({ 
      error: errorMessage,
      details: error.stderr || error.stdout || 'No additional details'
    }, { status: 500 });
  }
}
