import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check if API key is available
    const apiKey = process.env.VENICE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Server configuration error: Missing Venice API key' },
        { status: 500 }
      );
    }

    console.log('Testing Venice API with key:', apiKey ? 'Key exists' : 'No key');
    
    // Make request to Venice API to get available models
    const response = await fetch('https://api.venice.ai/api/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Venice API test response status:', response.status);

    // Get response as text first to avoid JSON parsing errors
    const responseText = await response.text();
    let responseData;
    
    try {
      // Try to parse as JSON if possible
      responseData = JSON.parse(responseText);
    } catch (e) {
      // If not valid JSON, use the text as is
      responseData = { rawText: responseText };
    }

    // Return full details about the response
    return NextResponse.json({
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(Array.from(response.headers.entries())),
      data: responseData,
    });
  } catch (error) {
    console.error('Error in test-api route:', error);
    return NextResponse.json({ 
      error: 'Failed to test Venice API',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
