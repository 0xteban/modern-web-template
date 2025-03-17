'use client';

import { ImageGeneratorForm } from '@/components/venice/image-generator-form';
import { GeneratedImageDisplay } from '@/components/venice/generated-image-display';
import { useVeniceImageGeneration } from '@/hooks/use-venice';

export default function ImageGeneratorPage() {
  const {
    isGenerating,
    generatedImage,
    error,
    generateImage,
  } = useVeniceImageGeneration();

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Venice AI Image Generator</h1>
        <p className="text-muted-foreground mb-8">
          Create stunning images using Venice AI's advanced image generation models.
        </p>

        <div className="space-y-8">
          <ImageGeneratorForm
            onSubmit={generateImage}
            isGenerating={isGenerating}
            error={error}
          />
          
          <GeneratedImageDisplay
            isGenerating={isGenerating}
            generatedImage={generatedImage}
          />
        </div>
      </div>
    </div>
  );
}
