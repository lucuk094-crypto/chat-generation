import { NextResponse } from 'next/server';
import { generateTimpaTeks } from '../../../../lib/generators/timpateks';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, text } = body;

    if (!username || !text) {
      return NextResponse.json({ error: 'Missing required fields: username and text' }, { status: 400 });
    }

    const imageBuffer = await generateTimpaTeks(username, text);

    const base64Image = imageBuffer.toString('base64');
    const dataUrl = `data:image/png;base64,${base64Image}`;

    return NextResponse.json({ image: dataUrl });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message || 'Failed to generate Timpa Teks image' }, { status: 500 });
  }
}
