import { NextRequest, NextResponse } from 'next/server';
import { generateWMP2Canvas } from '@/lib/generators/wmp2';

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text || text.trim() === '') {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    const imageBase64 = await generateWMP2Canvas({
      text: text.trim()
    });

    return NextResponse.json({ image: imageBase64 });
  } catch (error) {
    console.error('Error in WMP2 API:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to generate WMP2 canvas' 
      },
      { status: 500 }
    );
  }
}
