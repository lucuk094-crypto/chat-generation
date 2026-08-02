import { NextRequest, NextResponse } from 'next/server';
import { generateFakeFFDuo } from '@/lib/generators/fakeffduo';

export async function POST(request: NextRequest) {
  try {
    const { nickname1, nickname2 } = await request.json();

    if (!nickname1 || nickname1.trim() === '') {
      return NextResponse.json(
        { error: 'Nickname 1 is required' },
        { status: 400 }
      );
    }

    if (!nickname2 || nickname2.trim() === '') {
      return NextResponse.json(
        { error: 'Nickname 2 is required' },
        { status: 400 }
      );
    }

    const imageBase64 = await generateFakeFFDuo({
      nickname1: nickname1.trim(),
      nickname2: nickname2.trim()
    });

    return NextResponse.json({ image: imageBase64 });
  } catch (error) {
    console.error('Error in Fake FF Duo API:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to generate Fake FF Duo' 
      },
      { status: 500 }
    );
  }
}
