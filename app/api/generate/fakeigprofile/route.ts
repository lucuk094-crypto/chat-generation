import { NextRequest, NextResponse } from 'next/server';
import { generateFakeIGProfile } from '@/lib/generators/fakeigprofile';

export async function POST(request: NextRequest) {
  try {
    const { ppUrl, username, postingan, mengikuti, pengikut, bio } = await request.json();

    if (!username || username.trim() === '') {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      );
    }

    const imageBase64 = await generateFakeIGProfile({
      ppUrl: ppUrl?.trim() || 'https://i.pravatar.cc/150?img=1',
      username: username.trim(),
      postingan: postingan?.trim() || '0',
      mengikuti: mengikuti?.trim() || '0',
      pengikut: pengikut?.trim() || '0',
      bio: bio?.trim() || ''
    });

    return NextResponse.json({ image: imageBase64 });
  } catch (error) {
    console.error('Error in Fake IG Profile API:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to generate Fake IG Profile' 
      },
      { status: 500 }
    );
  }
}
