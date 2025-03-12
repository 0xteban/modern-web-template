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
    
    // Ensure the image data is properly formatted
    if (data.images && data.images.length > 0) {
      // Venice API returns base64 encoded image data
      // We need to ensure it has the proper data URL prefix based on the requested format
      data.images = data.images.map(image => {
        // If it's already a properly formatted URL or data URL, return as is
        if (image.startsWith('http') || image.startsWith('data:image/')) {
          return image;
        }
        
        // If it's a base64 string without the data URL prefix, add it
        // Use the format specified in the request, defaulting to webp
        const format = body.format || 'webp';
        return `data:image/${format};base64,${image}`;
      });
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error generating image:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
