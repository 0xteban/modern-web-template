/**
 * Venice AI Image Styles API Route
 * 
 * This route fetches the available image styles from the Venice AI API.
 * For more information, see:
 * - API Documentation: https://docs.venice.ai/api-reference/endpoint/image/styles
 * - Postman Collection: https://www.postman.com/veniceai/workspace/venice-ai-workspace/
 */

import { NextRequest, NextResponse } from 'next/server';
import { veniceStylePresetsFallback } from '@/lib/venice';

export async function GET(request: NextRequest) {
  try {
    // Check if API key is available
    if (!process.env.VENICE_API_KEY) {
      console.error('Venice API key is missing');
      return NextResponse.json(
        { 
          error: 'Server configuration error: Missing Venice API key',
          data: veniceStylePresetsFallback // Return fallback presets when API key is missing
        },
        { status: 200 } // Still return 200 since we have fallback data
      );
    }

    // Make request to Venice API to get available styles
    const response = await fetch('https://api.venice.ai/api/v1/image/styles', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.VENICE_API_KEY}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('Venice API error when fetching styles:', {
        status: response.status,
        statusText: response.statusText,
        details: errorData
      });

      // Return fallback presets on API error
      return NextResponse.json(
        { 
          error: 'Failed to fetch styles from Venice API. Using fallback presets.',
          data: veniceStylePresetsFallback
        },
        { status: 200 } // Still return 200 since we have fallback data
      );
    }

    const data = await response.json();
    
    // Log the styles received (for debugging)
    if (data.data && Array.isArray(data.data)) {
      console.log(`Retrieved ${data.data.length} style presets from Venice API`);
    } else {
      console.warn('Unexpected response format from Venice API styles endpoint');
      // Return fallback presets if API response format is unexpected
      return NextResponse.json(
        { 
          error: 'Unexpected response format from Venice API. Using fallback presets.',
          data: veniceStylePresetsFallback
        },
        { status: 200 }
      );
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching Venice styles:', error);
    // Return fallback presets on any error
    return NextResponse.json(
      { 
        error: 'Failed to fetch styles. Using fallback presets.',
        data: veniceStylePresetsFallback
      },
      { status: 200 } // Still return 200 since we have fallback data
    );
  }
}
