# Modern Web Template

A modern web application template built with React, TypeScript, Tailwind CSS, Supabase, and OpenAI integration.

## Features

- ⚛️ React with TypeScript
- 🎨 Tailwind CSS with Typography and Forms plugins
- 🔐 Supabase integration ready
- 🤖 OpenAI API integration ready
- ⚡ Vite for fast development
- 📱 Responsive design utilities

## Getting Started

1. Clone this template
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` and fill in your API keys:
   ```bash
   cp .env.example .env
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## Project Structure

```
src/
├── lib/
│   ├── supabase.ts    # Supabase client configuration
│   └── openai.ts      # OpenAI client configuration
├── App.tsx            # Main application component
└── index.css         # Global styles and Tailwind imports
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking

## Styling

The template includes pre-configured Tailwind CSS with:
- Typography plugin for rich text styling
- Forms plugin for form element styling
- Custom component classes in `index.css`

## Environment Variables

Required environment variables:
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `VITE_OPENAI_API_KEY`: Your OpenAI API key
