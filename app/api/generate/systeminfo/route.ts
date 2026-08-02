import { NextResponse } from 'next/server';
import { generateSystemInfo } from '../../../../lib/generators/systeminfo';

export async function POST(request: Request) {
  try {
    const imageBuffer = await generateSystemInfo();

    const base64Image = imageBuffer.toString('base64');
    const dataUrl = `data:image/png;base64,${base64Image}`;

    return NextResponse.json({ image: dataUrl });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message || 'Failed to generate System Info' }, { status: 500 });
  }
}
