/**
 * Venice AI Image Generation Hook
 * 
 * Custom hook for managing Venice AI image generation state and operations.
 * Implements proper error handling, validation, and state management following
 * React best practices.
 */

import { useState, useCallback } from 'react';
import { 
  VeniceImageGenerationParams,
  VeniceModel,
  VeniceImageResponse,
  VeniceStylePreset,
  VeniceImageGenerationParamsSchema
} from '@/types/venice';

interface UseVeniceImageGeneration {
  isGenerating: boolean;
  generatedImage: string | null;
  error: string | null;
  generateImage: (params: VeniceImageGenerationParams) => Promise<void>;
  clearError: () => void;
  clearImage: () => void;
}

export function useVeniceImageGeneration(): UseVeniceImageGeneration {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);
  const clearImage = useCallback(() => setGeneratedImage(null), []);

  const generateImage = useCallback(async (params: VeniceImageGenerationParams) => {
    try {
      setIsGenerating(true);
      setError(null);
      setGeneratedImage(null);

      // Validate parameters
      const validatedParams = VeniceImageGenerationParamsSchema.parse(params);

      const response = await fetch('/api/venice/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validatedParams),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Failed to generate image: ${response.statusText}`);
      }

      if (!data.images?.[0]) {
        throw new Error('No image was generated');
      }

      setGeneratedImage(data.images[0]);
    } catch (error) {
      console.error('Error generating image:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate image');
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return {
    isGenerating,
    generatedImage,
    error,
    generateImage,
    clearError,
    clearImage,
  };
}

interface UseVeniceModels {
  models: VeniceModel[];
  isLoading: boolean;
  error: string | null;
  fetchModels: () => Promise<void>;
}

export function useVeniceModels(): UseVeniceModels {
  const [models, setModels] = useState<VeniceModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchModels = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/venice/list-models');
      
      if (!response.ok) {
        throw new Error('Failed to fetch models');
      }

      const data = await response.json();
      setModels(data.data || []);
    } catch (error) {
      console.error('Error fetching Venice models:', error);
      setError('Failed to load models. Please check your Venice API key configuration.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    models,
    isLoading,
    error,
    fetchModels,
  };
}

interface UseVeniceStylePresets {
  stylePresets: VeniceStylePreset[];
  isLoading: boolean;
  error: string | null;
  fetchStylePresets: () => Promise<void>;
}

export function useVeniceStylePresets(): UseVeniceStylePresets {
  const [stylePresets, setStylePresets] = useState<VeniceStylePreset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStylePresets = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/venice/list-styles');
      
      if (!response.ok) {
        throw new Error('Failed to fetch style presets');
      }

      const data = await response.json();
      setStylePresets(data.data || []);
    } catch (error) {
      console.error('Error fetching Venice style presets:', error);
      setError('Failed to load style presets. Using fallback options.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    stylePresets,
    isLoading,
    error,
    fetchStylePresets,
  };
}
