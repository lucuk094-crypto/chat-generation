import { NextResponse } from 'next/server';
import { generateBratVideo } from '../../../../lib/generators/bratVid';

// Set max duration for video generation
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text, theme, blur, format } = body;

    if (!text) {
      return NextResponse.json({ error: 'Missing required text field' }, { status: 400 });
    }

    const videoBuffer = await generateBratVideo({
      text,
      theme: theme || 'white',
      blur: blur !== undefined ? blur : 0,
      format: format || 'mp4',
      frameDuration: 0.4,
      holdDuration: 1.2,
      maxWordPerLayer: 1,
      maxWordBeforeReset: [7, 8],
      fastProgress: true
    });

    const mimeType = format === 'gif' ? 'image/gif' : 'video/mp4';
    const base64Video = videoBuffer.toString('base64');
    const dataUrl = `data:${mimeType};base64,${base64Video}`;

    return NextResponse.json({ image: dataUrl });
  } catch (error: any) {
    console.error('BratVid Error:', error);
    const errorMessage = error.message || 'Failed to generate video';
    return NextResponse.json({ 
      error: errorMessage,
      details: error.stderr || error.stdout || 'No additional details'
    }, { status: 500 });
  }
}
