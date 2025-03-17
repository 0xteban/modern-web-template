import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check if API key is available and return a sanitized version for debugging
    const apiKey = process.env.VENICE_API_KEY;
    const keyExists = !!apiKey;
    const keyLength = apiKey?.length || 0;
    const firstFourChars = apiKey?.substring(0, 4) || '';
    const lastFourChars = apiKey?.substring(keyLength - 4) || '';
    
    return NextResponse.json({
      success: true,
      keyExists,
      keyLength,
      keyPreview: keyExists ? `${firstFourChars}...${lastFourChars}` : null,
      allEnvKeys: Object.keys(process.env).filter(key => key.includes('VENICE')),
    });
  } catch (error) {
    console.error('Error in test-key route:', error);
    return NextResponse.json({ error: 'Failed to check API key' }, { status: 500 });
  }
}
