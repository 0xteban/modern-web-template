'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { 
  VeniceImageGenerationParams,
  VeniceModel,
  commonImageDimensions,
  VeniceStylePreset,
  veniceStylePresets,
} from '@/types/venice';
import { useVeniceModels, useVeniceStylePresets } from '@/hooks/use-venice';

interface ImageGeneratorFormProps {
  onSubmit: (params: VeniceImageGenerationParams) => Promise<void>;
  isGenerating: boolean;
  error: string | null;
}

export function ImageGeneratorForm({ onSubmit, isGenerating, error }: ImageGeneratorFormProps) {
  const { models, isLoading: isLoadingModels, error: modelsError, fetchModels } = useVeniceModels();
  const { 
    stylePresets, 
    isLoading: isLoadingStylePresets, 
    error: stylePresetsError, 
    fetchStylePresets 
  } = useVeniceStylePresets();

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
  });

  useEffect(() => {
    fetchModels();
    fetchStylePresets();
  }, [fetchModels, fetchStylePresets]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setParams(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: keyof VeniceImageGenerationParams, value: string) => {
    setParams(prev => ({
      ...prev,
      [name]: name === 'width' || name === 'height' || name === 'steps' 
        ? parseInt(value, 10) 
        : name === 'cfg_scale' 
        ? parseFloat(value)
        : value === "none" ? "" : value,
    }));
  };

  const handleSliderChange = (name: keyof VeniceImageGenerationParams, value: number[]) => {
    setParams(prev => ({
      ...prev,
      [name]: value[0],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(params);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Image Generation Parameters</CardTitle>
        <CardDescription>Configure your image generation settings below.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="model">Model</Label>
            <Select
              value={params.model}
              onValueChange={(value) => handleSelectChange('model', value)}
              disabled={isLoadingModels}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent>
                {isLoadingModels ? (
                  <SelectItem value="loading" disabled>Loading models...</SelectItem>
                ) : (
                  models.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      {model.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {modelsError && (
              <p className="text-sm text-destructive">{modelsError}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="prompt">Prompt</Label>
            <Textarea
              id="prompt"
              name="prompt"
              value={params.prompt}
              onChange={handleInputChange}
              placeholder="A beautiful sunset over a mountain range"
              className="min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="negative_prompt">Negative Prompt</Label>
            <Textarea
              id="negative_prompt"
              name="negative_prompt"
              value={params.negative_prompt}
              onChange={handleInputChange}
              placeholder="Clouds, Rain, Snow"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="style_preset">Style Preset</Label>
            <Select
              value={params.style_preset || "none"}
              onValueChange={(value) => handleSelectChange('style_preset', value)}
              disabled={isLoadingStylePresets}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a style preset" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {isLoadingStylePresets ? (
                  <SelectItem value="loading" disabled>Loading style presets...</SelectItem>
                ) : (
                  stylePresets.map((style) => (
                    <SelectItem key={style} value={style}>
                      {style}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {stylePresetsError && (
              <p className="text-sm text-destructive">{stylePresetsError}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Image Dimensions</Label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="width">Width</Label>
                <Select
                  value={params.width?.toString()}
                  onValueChange={(value) => handleSelectChange('width', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select width" />
                  </SelectTrigger>
                  <SelectContent>
                    {commonImageDimensions.map(({ width }) => (
                      <SelectItem key={width} value={width.toString()}>
                        {width}px
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="height">Height</Label>
                <Select
                  value={params.height?.toString()}
                  onValueChange={(value) => handleSelectChange('height', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select height" />
                  </SelectTrigger>
                  <SelectContent>
                    {commonImageDimensions.map(({ height }) => (
                      <SelectItem key={height} value={height.toString()}>
                        {height}px
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Steps ({params.steps})</Label>
            <Slider
              value={[params.steps ?? 20]}
              onValueChange={(value) => handleSliderChange('steps', value)}
              min={10}
              max={50}
              step={1}
            />
          </div>

          <div className="space-y-2">
            <Label>CFG Scale ({params.cfg_scale})</Label>
            <Slider
              value={[params.cfg_scale ?? 7.5]}
              onValueChange={(value) => handleSliderChange('cfg_scale', value)}
              min={1}
              max={20}
              step={0.5}
            />
          </div>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" disabled={isGenerating || isLoadingModels}>
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              'Generate Image'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
