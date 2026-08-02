import { NextRequest, NextResponse } from 'next/server';
import { searchMurotal, getAllMurotal } from '@/lib/generators/murotal';

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();

    let results;
    if (query && query.trim() !== '') {
      // Search by query
      results = searchMurotal(query);
    } else {
      // Return all Qari
      results = getAllMurotal();
    }

    return NextResponse.json({
      success: true,
      total: results.length,
      data: results
    });
  } catch (error) {
    console.error('Error in murotal API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      },
      { status: 500 }
    );
  }
}
