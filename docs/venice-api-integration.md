# Venice AI API Integration

This document provides information about the Venice AI API integration in our application.

## Overview

The Venice AI API is used for image generation in our application. It provides a powerful set of features for creating AI-generated images with various styles and parameters.

## API Documentation

- [API Documentation](https://docs.venice.ai/api-reference/api-spec)
- [Image Generation](https://docs.venice.ai/api-reference/endpoint/image/generate)
- [Image Styles](https://docs.venice.ai/api-reference/endpoint/image/styles)
- [Postman Collection](https://www.postman.com/veniceai/workspace/venice-ai-workspace/)

## Style Presets

The Venice API supports various style presets that can be used to influence the aesthetic of generated images. The valid style presets include:

```
'3D Model'
'Analog Film'
'Anime'
'Cinematic'
'Comic Book'
'Digital Art'
'Enhance'
'Fantasy Art'
'Isometric'
'Line Art'
'Low Poly'
'Neon Punk'
'Origami'
'Photographic'
'Pixel Art'
'Sketch'
'Watercolor'
```

**Important**: The style preset values must be used exactly as listed above. The Venice API is strict about the format and will return a 400 error if an invalid style preset is provided.

## Implementation

Our application implements the Venice AI API in the following components:

1. **Venice Utility Library** (`src/lib/venice.ts`):
   - Contains types for image generation parameters
   - Provides functions to fetch models and generate images
   - Includes a list of fallback style presets

2. **API Routes**:
   - `/api/venice/generate-image`: Handles image generation requests
   - `/api/venice/list-models`: Fetches available models from the Venice API
   - `/api/venice/list-styles`: Fetches available style presets from the Venice API

3. **Image Generator Page** (`src/app/image-generator/page.tsx`):
   - Provides a user interface for configuring image generation parameters
   - Displays generated images and handles errors

## Troubleshooting

If you encounter a 400 Bad Request error with a message about invalid style presets, ensure that:

1. The style preset value is exactly as listed in the valid style presets
2. The API key is correctly configured in `.env.local`
3. You're using the latest version of the Venice API

For more detailed examples and API usage, refer to the [Venice API Postman Collection](https://www.postman.com/veniceai/workspace/venice-ai-workspace/).
