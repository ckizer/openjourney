import OpenAI from "openai";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { prompt, apiKey: userApiKey } = await request.json();

    if (!prompt) {
      return new Response("Prompt is required", { status: 400 });
    }

    // Use user-provided API key if available, otherwise fallback to environment variable
    const apiKey = userApiKey || process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      return new Response("No API key provided", { status: 401 });
    }

    const openai = new OpenAI({ apiKey });

    console.log("Starting streaming image generation for prompt:", prompt);

    // Create a ReadableStream for Server-Sent Events
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        
        // Helper function to send SSE data
        const sendSSE = (type: string, data: Record<string, unknown>) => {
          const sseData = `data: ${JSON.stringify({ type, data })}\n\n`;
          controller.enqueue(encoder.encode(sseData));
        };

        try {
          // Send initial status
          sendSSE('status', { message: 'Starting image generation...' });

          const openaiStream = await openai.images.generate({
            prompt: prompt,
            model: "gpt-image-1",
            stream: true,
            partial_images: 1,
          });

          let partialCount = 0;
          
          // Process the OpenAI stream
          for await (const event of openaiStream) {
            console.log("OpenAI event type:", event.type);
            
            if (event.type === "image_generation.partial_image") {
              partialCount++;
              console.log(`Sending partial image #${partialCount} to frontend`);
              
              // Send partial image to frontend immediately
              sendSSE('partial_image', {
                imageData: event.b64_json,
                partialIndex: partialCount,
                url: `data:image/png;base64,${event.b64_json}`
              });
              
            } else if (event.type === "image_generation.completed") {
              console.log("Generation completed, sending final image");
              
              // Check if completed event has final image
              if (event.b64_json) {
                sendSSE('final_image', {
                  imageData: event.b64_json,
                  url: `data:image/png;base64,${event.b64_json}`,
                  id: `${Date.now()}-0`,
                  prompt: prompt
                });
              } else {
                console.log("No final image in completed event");
                sendSSE('error', { message: 'No final image received' });
              }
              break;
            }
          }

          // Send completion signal
          sendSSE('done', { message: 'Image generation complete' });

        } catch (error) {
          console.error("Error in streaming generation:", error);
          sendSSE('error', { message: 'Failed to generate image' });
        } finally {
          controller.close();
        }
      }
    });

    // Return streaming response with SSE headers
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });

  } catch (error) {
    console.error("Error in API route:", error);
    return new Response("Failed to generate images", { status: 500 });
  }
} 