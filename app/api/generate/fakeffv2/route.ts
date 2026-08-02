import { NextRequest, NextResponse } from 'next/server';
import { generateFakeFFV2 } from '@/lib/generators/fakeffv2';

export async function POST(request: NextRequest) {
  try {
    const { username } = await request.json();

    if (!username || username.trim() === '') {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      );
    }

    const imageBase64 = await generateFakeFFV2({
      username: username.trim()
    });

    return NextResponse.json({ image: imageBase64 });
  } catch (error) {
    console.error('Error in FakeFF V2 API:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to generate FakeFF V2' 
      },
      { status: 500 }
    );
  }
}
