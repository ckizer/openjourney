# OpenAI Chat Setup Guide

## Overview
A new chat page has been added to your OpenJourney app at `/chat` that integrates with OpenAI's GPT-4 using prompt-kit components.

## Components Used
- **ChatContainer**: Main container with auto-scrolling behavior
- **ScrollButton**: Floating button to scroll to bottom 
- **Message**: Display chat messages with proper styling
- **PromptInput**: Input field for typing messages

## Setup Instructions

### 1. Set up OpenAI API Key
Create a `.env.local` file in your project root and add your OpenAI API key:

```bash
OPENAI_API_KEY=your_openai_api_key_here
```

### 2. Get OpenAI API Key
1. Visit [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in to your account
3. Go to API Keys section
4. Create a new API key
5. Copy the key to your `.env.local` file

### 3. Start the Development Server
```bash
npm run dev
```

### 4. Access the Chat
- Navigate to `http://localhost:3000` for the main gallery
- Click the "Chat" button in the top navigation
- Or go directly to `http://localhost:3000/chat`

## Features
- ✅ Real-time chat with GPT-4o-mini
- ✅ Message history persistence during session
- ✅ Loading indicators
- ✅ Error handling
- ✅ Responsive design
- ✅ Auto-scrolling to latest messages
- ✅ Smooth navigation between gallery and chat

## File Structure
```
src/
├── app/
│   ├── chat/
│   │   └── page.tsx          # Chat page component
│   └── api/
│       └── chat/
│           └── route.ts       # OpenAI API integration
└── components/ui/
    ├── chat-container.tsx     # Auto-scrolling container
    ├── scroll-button.tsx      # Scroll to bottom button
    ├── message.tsx           # Message display component
    └── prompt-input.tsx      # Chat input component
```

## Configuration
The chat uses GPT-4o-mini model with:
- Max tokens: 1000
- Temperature: 0.7
- Message history context

You can modify these settings in `src/app/api/chat/route.ts`.

## Next Steps
Your chat app is ready to use! The navigation has been integrated into your existing OpenJourney app for seamless switching between image generation and chat functionality.