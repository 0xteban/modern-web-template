/**
 * Venice AI Image Generation Utility Library
 * 
 * This library provides utilities for interacting with the Venice AI API,
 * including helper functions for fetching models, style presets, and generating images.
 * 
 * For more information on the Venice AI API:
 * - API Documentation: https://docs.venice.ai/api-reference/api-spec
 * - Image Generation: https://docs.venice.ai/api-reference/endpoint/image/generate
 * - Image Styles: https://docs.venice.ai/api-reference/endpoint/image/styles
 * - Postman Collection: https://www.postman.com/veniceai/workspace/venice-ai-workspace/
 */

import { 
  VeniceImageGenerationParams, 
  VeniceImageGenerationParamsSchema,
  VeniceModel, 
  VeniceStylePreset,
  veniceStylePresets
} from '@/types/venice';

/**
 * Fetches available models from the Venice API
 * @returns Promise<VeniceModel[]>
 * @throws Error if the API request fails
 */
export async function fetchVeniceModels(): Promise<VeniceModel[]> {
  try {
    const response = await fetch('/api/venice/list-models');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.status}`);
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching Venice models:', error);
    throw new Error('Failed to fetch Venice models. Please check your API configuration.');
  }
}

/**
 * Fetches available style presets from the Venice API
 * @returns Promise<VeniceStylePreset[]>
 * @throws Error if the API request fails
 */
export async function fetchVeniceStylePresets(): Promise<VeniceStylePreset[]> {
  try {
    const response = await fetch('/api/venice/list-styles');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch style presets: ${response.status}`);
    }

    const data = await response.json();
    return data.data || [...veniceStylePresets];
  } catch (error) {
    console.error('Error fetching Venice style presets:', error);
    return [...veniceStylePresets]; // Create a mutable copy of the readonly array
  }
}

/**
 * Validates image generation parameters against the Zod schema
 * @param params Parameters to validate
 * @returns The validated parameters
 * @throws ZodError if validation fails
 */
export function validateImageGenerationParams(params: unknown): VeniceImageGenerationParams {
  try {
    return VeniceImageGenerationParamsSchema.parse(params);
  } catch (error) {
    console.error('Validation error:', error);
    throw error;
  }
}

/**
 * Generates an image using the Venice API
 * @param params Image generation parameters
 * @returns Promise with the generated image data
 * @throws Error if the API request fails
 */
export async function generateImage(params: VeniceImageGenerationParams) {
  try {
    // Validate parameters before sending
    const validatedParams = validateImageGenerationParams(params);

    const response = await fetch('/api/venice/generate-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validatedParams),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.error || `Failed to generate image: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.images?.[0]) {
      throw new Error('No image was generated');
    }

    return data;
  } catch (error) {
    console.error('Error generating image:', error);
    throw error;
  }
}
