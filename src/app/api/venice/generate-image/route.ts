import { NextRequest, NextResponse } from 'next/server';

// Define the response type
interface VeniceImageResponse {
  id: string;
  images: string[];
  timing: {
    inferenceDuration: number;
    inferencePreprocessingTime: number;
    inferenceQueueTime: number;
    total: number;
  };
}

export async function POST(request: NextRequest) {
  try {
    // Get the request body
    const body = await request.json();
    
    // Validate required fields
    if (!body.model || !body.prompt) {
      return NextResponse.json(
        { error: 'Missing required fields: model and prompt' },
        { status: 400 }
      );
    }

    // Make request to Venice API
    const response = await fetch('https://api.venice.ai/api/v1/image/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.VENICE_API_KEY}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      return NextResponse.json(
        { 
          error: 'Venice API error', 
          status: response.status,
          details: errorData 
        },
        { status: response.status }
      );
    }

    const data: VeniceImageResponse = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error generating image:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
