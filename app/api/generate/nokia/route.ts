import { NextRequest, NextResponse } from 'next/server';
import { generateNokiaCanvas } from '@/lib/generators/nokia';

export async function POST(request: NextRequest) {
  try {
    const { text, from, date, time, title } = await request.json();

    if (!text || text.trim() === '') {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    const imageBase64 = await generateNokiaCanvas({
      text: text.trim(),
      from: from?.trim() || 'Vanx',
      date: date?.trim() || new Date().toLocaleDateString('en-GB').replace(/\//g, '/'),
      time: time?.trim() || new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      title: title?.trim() || 'Nokia'
    });

    return NextResponse.json({ image: imageBase64 });
  } catch (error) {
    console.error('Error in Nokia API:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to generate Nokia canvas' 
      },
      { status: 500 }
    );
  }
}
