import { z } from 'zod';

// Zod schema for Venice API parameters
export const VeniceImageGenerationParamsSchema = z.object({
  model: z.string().min(1, "Model is required"),
  prompt: z.string().min(1, "Prompt is required"),
  negative_prompt: z.string().optional(),
  style_preset: z.string().optional(),
  height: z.number().int().min(512).max(1536).optional(),
  width: z.number().int().min(512).max(1536).optional(),
  steps: z.number().int().min(10).max(50).optional(),
  cfg_scale: z.number().min(1).max(20).optional(),
  safe_mode: z.boolean().optional(),
});

export type VeniceImageGenerationParams = z.infer<typeof VeniceImageGenerationParamsSchema>;

export interface VeniceModel {
  id: string;
  name: string;
  description: string;
  type: string;
  status: string;
}

export interface VeniceApiError {
  error: string;
  status?: number;
  statusText?: string;
  details?: unknown;
}

export interface VeniceImageResponse {
  id: string;
  images: string[];
  timing: {
    inferenceDuration: number;
    inferencePreprocessingTime: number;
    inferenceQueueTime: number;
    total: number;
  };
}

// Available style presets
export const veniceStylePresets = [
  '3D Model',
  'Analog Film',
  'Anime',
  'Cinematic',
  'Comic Book',
  'Digital Art',
  'Enhance',
  'Fantasy Art',
  'Isometric',
  'Line Art',
  'Low Poly',
  'Neon Punk',
  'Origami',
  'Photographic',
  'Pixel Art',
  'Sketch',
  'Watercolor'
] as const;

export type VeniceStylePreset = typeof veniceStylePresets[number];

// Common image dimensions that work well with Venice AI
export const commonImageDimensions = [
  { width: 512, height: 512 },
  { width: 768, height: 768 },
  { width: 1024, height: 1024 },
  { width: 1024, height: 1536 },
  { width: 1536, height: 1024 }
] as const;
