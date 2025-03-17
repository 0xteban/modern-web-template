/**
 * Venice AI Image Generation API Route
 * 
 * This route handles requests to generate images using the Venice AI API.
 * It validates the request parameters, formats them correctly, and forwards
 * the request to the Venice API.
 * 
 * For more information on the Venice AI API:
 * - API Documentation: https://docs.venice.ai/api-reference/api-spec
 * - Image Generation: https://docs.venice.ai/api-reference/endpoint/image/generate
 * - Image Styles: https://docs.venice.ai/api-reference/endpoint/image/styles
 * - Postman Collection: https://www.postman.com/veniceai/workspace/venice-ai-workspace/
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateImageGenerationParams, veniceStylePresetsFallback } from '@/lib/venice';

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
    // Get and validate the request body
    const body = await request.json();
    
    try {
      validateImageGenerationParams(body);
    } catch (error) {
      console.error('Validation error:', error);
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Invalid request parameters' },
        { status: 400 }
      );
    }

    // Check if API key is available
    if (!process.env.VENICE_API_KEY) {
      console.error('Venice API key is missing');
      return NextResponse.json(
        { error: 'Server configuration error: Missing Venice API key' },
        { status: 500 }
      );
    }

    // Format style_preset to match Venice API requirements
    if (body.style_preset) {
      // Venice API expects style presets with proper capitalization like "3D Model"
      // Validate against known valid style presets
      if (!veniceStylePresetsFallback.includes(body.style_preset)) {
        return NextResponse.json(
          { error: `Invalid style preset: ${body.style_preset}. Please select a valid style preset.` },
          { status: 400 }
        );
      }
    }

    // Log the request being sent to Venice API (for debugging)
    console.log('Sending request to Venice API:', {
      ...body,
      // Don't log the full prompt for privacy
      prompt: body.prompt ? `${body.prompt.substring(0, 20)}...` : undefined
    });

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
      console.error('Venice API response error:', {
        status: response.status,
        statusText: response.statusText,
        details: errorData
      });

      return NextResponse.json(
        { 
          error: 'Venice API error', 
          status: response.status,
          statusText: response.statusText,
          details: errorData
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Validate the response has images
    if (!data.images?.length) {
      console.error('Venice API returned no images:', data);
      return NextResponse.json(
        { error: 'No images were generated' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error generating image:', error);
    return NextResponse.json(
      { error: 'Failed to generate image' },
      { status: 500 }
    );
  }
}
