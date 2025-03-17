'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';

interface GeneratedImageDisplayProps {
  isGenerating: boolean;
  generatedImage: string | null;
}

export function GeneratedImageDisplay({ isGenerating, generatedImage }: GeneratedImageDisplayProps) {
  const handleDownload = () => {
    if (!generatedImage) return;
    
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `venice-generated-${new Date().getTime()}.png`;
    link.click();
  };

  if (isGenerating) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="animate-spin h-12 w-12 mx-auto" />
            <p className="mt-4 text-muted-foreground">Generating your image...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!generatedImage) {
    return null;
  }

  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <div className="relative aspect-square w-full overflow-hidden rounded-lg">
          <img
            src={generatedImage}
            alt="Generated image"
            className="object-cover w-full h-full"
          />
        </div>
        <Button
          variant="outline"
          className="w-full"
          onClick={handleDownload}
        >
          <Download className="mr-2 h-4 w-4" />
          Download Image
        </Button>
      </CardContent>
    </Card>
  );
}
