import { NextResponse } from 'next/server';
import { getPhoneSpecs } from '../../../../lib/generators/phonespecs';

// Set max duration for Vercel serverless function
export const maxDuration = 30; // 30 seconds

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { query } = body;

    if (!query || !query.trim()) {
      return NextResponse.json({ 
        status: false,
        error: 'Masukkan nama ponsel yang ingin dicari' 
      }, { status: 400 });
    }

    // Add timeout wrapper
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout setelah 25 detik')), 25000);
    });

    const specs = await Promise.race([
      getPhoneSpecs(query.trim()),
      timeoutPromise
    ]) as any;

    return NextResponse.json(specs);
  } catch (error: any) {
    console.error('Phone Specs Error:', error);
    
    const errorMessage = error.message || 'Gagal mengambil spesifikasi ponsel';
    
    return NextResponse.json({ 
      status: false,
      error: errorMessage,
      hint: 'Coba gunakan nama yang lebih spesifik (contoh: "Samsung Galaxy S23" atau "iPhone 15 Pro")'
    }, { status: 500 });
  }
}
