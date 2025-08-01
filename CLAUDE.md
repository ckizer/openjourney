# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Openjourney is a Next.js 15 application that clones the MidJourney UI for AI image generation using OpenAI's GPT-4o image generation model (gpt-image-1). This is an image-only application with all video features removed.

## Development Commands

```bash
# Start development server with Turbopack
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

## Architecture

### Core Application Flow
- **Main Page** (`src/app/page.tsx`): Client-side React component with sticky prompt bar and main content grid
- **Content Management**: Uses state to manage image/video generations with loading states
- **API Integration**: Three main endpoints for AI generation in `src/app/api/`

### Key Components
- **PromptBar** (`src/components/prompt-bar.tsx`): Input interface with logo and generation buttons
- **ContentGrid** (`src/components/content-grid.tsx`): Main orchestrator handling generation states, API calls, and media display
- **ImageGrid/VideoGrid**: Display components for generated content with hover interactions
- **FocusedMediaView**: Fullscreen lightbox with navigation
- **LoadingGrid**: Skeleton states during generation

### API Routes
- `/api/generate-images`: OpenAI GPT-4o integration (4 images, 1024x1024) - makes 4 parallel requests using gpt-image-1 model

### State Management
- Local React state for generations array with TypeScript interfaces
- LocalStorage for user API keys
- Sample data initialization to avoid hydration issues

### Key Technical Details
- Uses Next.js 15 App Router with Turbopack for development
- TypeScript with strict mode enabled
- Tailwind CSS v4 for styling with ShadCN UI components
- Framer Motion for animations
- OpenAI SDK for image generation, Google GenAI SDK for video generation
- Base64 image handling for API communication

### Environment Variables
- `OPENAI_API_KEY`: OpenAI API key for image generation (optional - users can provide via UI)
- `GOOGLE_AI_API_KEY`: Google AI API key for video generation (optional - users can provide via UI)

### File Structure Notes
- Components use barrel exports through `ui/` folder
- Path aliases configured: `@/*` maps to `./src/*`
- Sample media stored in `public/sample-images/` and `public/sample-videos/`