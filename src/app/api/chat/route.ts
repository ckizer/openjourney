import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 🎯 CUSTOMIZE YOUR AI'S PERSONALITY HERE
const SYSTEM_PROMPTS = {
  default: `You are a helpful, creative, and knowledgeable AI assistant. You provide clear, concise, andaccurate responses. When appropriate, you can be conversational and engaging while maintaining professionalism. when asked who you are you respond with Kizer AI, developed by Court Kizer`,
  
  creative: `You are a highly creative AI assistant with expertise in art, design, and innovation. You think outside the box and provide imaginative solutions while being practical and helpful.`,
  
  technical: `You are a technical expert AI assistant specializing in programming, development, and technology. You provide detailed, accurate technical guidance with code examples when appropriate.`,
  
  casual: `You are a friendly, casual AI assistant. You're like talking to a knowledgeable friend - helpful, conversational, and easy-going. Use a relaxed tone while still being informative.`,
  
  professional: `You are a professional AI assistant for business contexts. You provide clear, structured, and formal responses suitable for workplace communication while remaining helpful and accessible.`
};

// 🎛️ CONFIGURATION - Change these settings
const CHAT_CONFIG = {
  systemPrompt: SYSTEM_PROMPTS.default, // Change to any prompt above
  
  // 🤖 MODEL OPTIONS:
  // Standard models: 'gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo'
  // Reasoning models: 'o3-mini', 'o3', 'o1-mini', 'o1-preview'
  model: 'o3-mini',                     
  
  maxCompletionTokens: 25000,           // For o3/o1 models: includes reasoning + response tokens
                                        // For standard models: just response tokens
  temperature: 0.7,                     // Will be forced to 1.0 for reasoning models
};

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    // Add system message to define the AI's behavior/personality
    const systemMessage = {
      role: 'system' as const,
      content: CHAT_CONFIG.systemPrompt
    };

    // Combine system message with user messages
    const allMessages = [systemMessage, ...messages];

    // Configure parameters based on model type
    const isReasoningModel = CHAT_CONFIG.model.startsWith('o1') || CHAT_CONFIG.model.startsWith('o3');
    
    const completionParams = {
      model: CHAT_CONFIG.model,
      messages: allMessages,
      ...(isReasoningModel 
        ? {
            // o1/o3 models use max_completion_tokens and fixed temperature
            max_completion_tokens: CHAT_CONFIG.maxCompletionTokens,
            temperature: 1.0 as const, // Required to be 1.0 for reasoning models
          }
        : {
            // Standard models use max_tokens and configurable temperature
            max_tokens: CHAT_CONFIG.maxCompletionTokens,
            temperature: CHAT_CONFIG.temperature || 0.7,
          }
      ),
    };

    const completion = await openai.chat.completions.create(completionParams);

    const responseMessage = completion.choices[0]?.message;

    if (!responseMessage) {
      return NextResponse.json(
        { error: 'No response from OpenAI' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      content: responseMessage.content,
    });
  } catch (error) {
    console.error('OpenAI API error:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: `OpenAI API error: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}