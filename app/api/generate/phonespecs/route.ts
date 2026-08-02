import { NextResponse } from 'next/server';
import { getPhoneSpecs } from '../../../../lib/generators/phonespecs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { query } = body;

    if (!query) {
      return NextResponse.json({ error: 'Missing required field: query' }, { status: 400 });
    }

    const specs = await getPhoneSpecs(query);

    return NextResponse.json(specs);
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ 
      status: false,
      error: error.message || 'Failed to get phone specs' 
    }, { status: 500 });
  }
}
