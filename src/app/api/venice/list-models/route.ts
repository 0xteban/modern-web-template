/**
 * Venice AI Models API Route
 * 
 * This route fetches the available models from the Venice AI API.
 * For more information, see:
 * - API Documentation: https://docs.venice.ai/api-reference/endpoint/model/list
 * - Postman Collection: https://www.postman.com/veniceai/workspace/venice-ai-workspace/
 */

import { NextRequest, NextResponse } from 'next/server';

interface VeniceModelResponse {
  models: Array<{
    id: string;
    name: string;
    description: string;
    parameters?: {
      steps?: { min: number; max: number; default: number };
      cfg_scale?: { min: number; max: number; default: number };
      width?: number[];
      height?: number[];
    };
  }>;
}

export async function GET(request: NextRequest) {
  try {
    // Check if API key is available
    if (!process.env.VENICE_API_KEY) {
      console.error('Venice API key is missing');
      return NextResponse.json(
        { error: 'Server configuration error: Missing Venice API key' },
        { status: 500 }
      );
    }

    // Make request to Venice API to get available models
    const response = await fetch('https://api.venice.ai/api/v1/model/list', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.VENICE_API_KEY}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('Venice API error when fetching models:', {
        status: response.status,
        statusText: response.statusText,
        details: errorData
      });

      return NextResponse.json(
        { 
          error: 'Failed to fetch models from Venice API',
          status: response.status,
          statusText: response.statusText,
          details: errorData
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Log the models received (for debugging)
    if (data.data && Array.isArray(data.data)) {
      console.log(`Retrieved ${data.data.length} models from Venice API`);
    } else {
      console.warn('Unexpected response format from Venice API models endpoint');
      return NextResponse.json(
        { error: 'Unexpected response format from Venice API' },
        { status: 500 }
      );
    }
    
    // Process the models based on the actual API response structure
    let processedModels = [];
    
    // Check if we have a 'models' array directly
    if (Array.isArray(data.models)) {
      processedModels = data.models.map((model: any) => ({
        id: model.id,
        name: model.name || model.id,
        description: model.description || '',
        parameters: {
          steps: { min: 10, max: 50, default: 20 },
          cfg_scale: { min: 1, max: 15, default: 7.5 },
        }
      }));
    } 
    // Check if we have a 'data' object that contains models
    else if (data.data && Array.isArray(data.data.models)) {
      processedModels = data.data.models.map((model: any) => ({
        id: model.id,
        name: model.name || model.id,
        description: model.description || '',
        parameters: {
          steps: { min: 10, max: 50, default: 20 },
          cfg_scale: { min: 1, max: 15, default: 7.5 },
        }
      }));
    }
    // If we can't find models in the expected structure, use a fallback approach
    else {
      // Try to extract models from whatever structure we have
      const possibleModels: Array<{
        id: string;
        name: string;
        description: string;
      }> = [];
      
      // Look for objects with 'id' properties that might be models
      if (typeof data === 'object') {
        Object.entries(data).forEach(([key, value]: [string, any]) => {
          if (value && typeof value === 'object' && value.id) {
            possibleModels.push({
              id: value.id,
              name: value.name || value.id,
              description: value.description || '',
            });
          }
        });
      }
      
      if (possibleModels.length > 0) {
        processedModels = possibleModels.map((model: any) => ({
          ...model,
          parameters: {
            steps: { min: 10, max: 50, default: 20 },
            cfg_scale: { min: 1, max: 15, default: 7.5 },
          }
        }));
      } else {
        // If we couldn't find any models, use fallback models
        processedModels = [
          { 
            id: 'fluently-xl', 
            name: 'Fluently XL', 
            description: 'High-quality image generation model',
            parameters: {
              steps: { min: 10, max: 50, default: 20 },
              cfg_scale: { min: 1, max: 15, default: 7.5 },
            }
          },
          { 
            id: 'sdxl-turbo', 
            name: 'SDXL Turbo', 
            description: 'Fast image generation with good quality',
            parameters: {
              steps: { min: 1, max: 30, default: 10 },
              cfg_scale: { min: 1, max: 15, default: 7.5 },
            }
          },
          { 
            id: 'realistic-vision', 
            name: 'Realistic Vision', 
            description: 'Photorealistic image generation',
            parameters: {
              steps: { min: 10, max: 50, default: 25 },
              cfg_scale: { min: 1, max: 15, default: 7.5 },
            }
          }
        ];
      }
    }
    
    console.log(`Processed ${processedModels.length} models`);
    
    // Return the processed models
    return NextResponse.json({ models: processedModels });
  } catch (error) {
    console.error('Error fetching Venice models:', error);
    return NextResponse.json(
      { error: 'Failed to fetch models' },
      { status: 500 }
    );
  }
}
