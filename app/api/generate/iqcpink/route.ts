import { NextResponse } from 'next/server';
import { generateIQCPink } from '../../../../lib/generators/iqcpink';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text, time } = body;

    if (!text || !time) {
      return NextResponse.json({ error: 'Missing required fields: text and time' }, { status: 400 });
    }

    const imageBuffer = await generateIQCPink(text, time);

    const base64Image = imageBuffer.toString('base64');
    const dataUrl = `data:image/png;base64,${base64Image}`;

    return NextResponse.json({ image: dataUrl });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message || 'Failed to generate IQC Pink' }, { status: 500 });
  }
}
