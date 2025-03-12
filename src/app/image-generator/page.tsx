'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { VeniceImageGenerationParams, veniceImageModels, veniceStylePresets, generateImage } from '@/lib/venice';
import Image from 'next/image';

export default function ImageGeneratorPage() {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [params, setParams] = useState<VeniceImageGenerationParams>({
    model: 'fluently-xl',
    prompt: '',
    negative_prompt: '',
    style_preset: '',
    height: 1024,
    width: 1024,
    steps: 20,
    cfg_scale: 7.5,
    safe_mode: true,
    hide_watermark: false,
    format: 'webp',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    // Handle numeric values
    if (type === 'number') {
      setParams({
        ...params,
        [name]: parseFloat(value),
      });
    } else {
      setParams({
        ...params,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!params.prompt) {
      setError('Please enter a prompt');
      return;
    }
    
    try {
      setIsGenerating(true);
      setError(null);
      
      const result = await generateImage(params);
      
      if (result.images && result.images.length > 0) {
        setGeneratedImage(result.images[0]);
      } else {
        setError('No image was generated');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Venice AI Image Generator</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Image Parameters</CardTitle>
            <CardDescription>
              Configure the parameters for your AI-generated image
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="model" className="text-sm font-medium">
                  Model
                </label>
                <select
                  id="model"
                  name="model"
                  value={params.model}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md"
                >
                  {veniceImageModels.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.name} - {model.description}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="prompt" className="text-sm font-medium">
                  Prompt
                </label>
                <Input
                  id="prompt"
                  name="prompt"
                  value={params.prompt}
                  onChange={handleChange}
                  placeholder="A beautiful sunset over a mountain range"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="negative_prompt" className="text-sm font-medium">
                  Negative Prompt
                </label>
                <Input
                  id="negative_prompt"
                  name="negative_prompt"
                  value={params.negative_prompt}
                  onChange={handleChange}
                  placeholder="Clouds, Rain, Snow"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="style_preset" className="text-sm font-medium">
                  Style Preset
                </label>
                <select
                  id="style_preset"
                  name="style_preset"
                  value={params.style_preset}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">None</option>
                  {veniceStylePresets.map((style) => (
                    <option key={style} value={style}>
                      {style}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="width" className="text-sm font-medium">
                    Width
                  </label>
                  <Input
                    id="width"
                    name="width"
                    type="number"
                    value={params.width}
                    onChange={handleChange}
                    min={512}
                    max={1536}
                    step={8}
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="height" className="text-sm font-medium">
                    Height
                  </label>
                  <Input
                    id="height"
                    name="height"
                    type="number"
                    value={params.height}
                    onChange={handleChange}
                    min={512}
                    max={1536}
                    step={8}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="steps" className="text-sm font-medium">
                    Steps
                  </label>
                  <Input
                    id="steps"
                    name="steps"
                    type="number"
                    value={params.steps}
                    onChange={handleChange}
                    min={10}
                    max={50}
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="cfg_scale" className="text-sm font-medium">
                    CFG Scale
                  </label>
                  <Input
                    id="cfg_scale"
                    name="cfg_scale"
                    type="number"
                    value={params.cfg_scale}
                    onChange={handleChange}
                    min={1}
                    max={15}
                    step={0.5}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <input
                    id="safe_mode"
                    name="safe_mode"
                    type="checkbox"
                    checked={params.safe_mode}
                    onChange={(e) => setParams({...params, safe_mode: e.target.checked})}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <label htmlFor="safe_mode" className="text-sm font-medium">
                    Safe Mode
                  </label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    id="hide_watermark"
                    name="hide_watermark"
                    type="checkbox"
                    checked={params.hide_watermark}
                    onChange={(e) => setParams({...params, hide_watermark: e.target.checked})}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <label htmlFor="hide_watermark" className="text-sm font-medium">
                    Hide Watermark
                  </label>
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full"
                disabled={isGenerating}
              >
                {isGenerating ? 'Generating...' : 'Generate Image'}
              </Button>
              
              {error && (
                <div className="p-3 bg-red-100 text-red-800 rounded-md">
                  {error}
                </div>
              )}
            </form>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Generated Image</CardTitle>
            <CardDescription>
              Your AI-generated image will appear here
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center min-h-[400px]">
            {isGenerating ? (
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-4">Generating your image...</p>
              </div>
            ) : generatedImage ? (
              <div className="relative w-full h-full min-h-[400px]">
                <Image
                  src={generatedImage}
                  alt="Generated image"
                  fill
                  className="object-contain rounded-md"
                />
              </div>
            ) : (
              <div className="text-center text-gray-500">
                <p>No image generated yet</p>
                <p className="text-sm mt-2">Configure parameters and click Generate</p>
              </div>
            )}
          </CardContent>
          {generatedImage && (
            <CardFooter className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => window.open(generatedImage, '_blank')}>
                Open in New Tab
              </Button>
              <Button variant="outline" onClick={() => {
                const link = document.createElement('a');
                link.href = generatedImage;
                link.download = `venice-image-${new Date().getTime()}.${params.format || 'webp'}`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}>
                Download
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
}
