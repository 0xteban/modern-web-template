// Types for Venice AI image generation
export interface VeniceImageGenerationParams {
  model: string;
  prompt: string;
  negative_prompt?: string;
  style_preset?: string;
  height?: number;
  width?: number;
  steps?: number;
  cfg_scale?: number;
  seed?: number;
  lora_strength?: number;
  safe_mode?: boolean;
  hide_watermark?: boolean;
  format?: 'webp' | 'png' | 'jpg';
}

// Available Venice AI image generation models
export const veniceImageModels = [
  { id: 'fluently-xl', name: 'Fluently XL', description: 'High-quality image generation model' },
  { id: 'sdxl-turbo', name: 'SDXL Turbo', description: 'Fast image generation with good quality' },
  { id: 'realistic-vision', name: 'Realistic Vision', description: 'Photorealistic image generation' },
  { id: 'dreamshaper', name: 'Dreamshaper', description: 'Creative and artistic image generation' },
];

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
  'Watercolor',
];

// Generate image using Venice AI API through our Next.js API route
export async function generateImage(params: VeniceImageGenerationParams) {
  try {
    const response = await fetch('/api/venice/generate-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error generating image:', error);
    throw error;
  }
}
