

import { GoogleGenAI, GenerateContentResponse, Chat, Type, GenerateContentStreamResult } from "@google/genai";

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY, apiVersion: 'v1alpha' });
let activeChat: Chat | null = null;

// --- Text Generation ---
export const generateText = async (prompt: string): Promise<GenerateContentResponse> => {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
        thinkingConfig: { thinkingBudget: 0 } // For faster response
    }
  });
  return response;
};

// --- Image Generation ---
export const generateImage = async (prompt: string, aspectRatio: string): Promise<string> => {
    const response = await ai.models.generateImages({
        model: 'imagen-3.0-generate-002',
        prompt: prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: aspectRatio,
        },
    });

    const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
    return `data:image/jpeg;base64,${base64ImageBytes}`;
};

// --- Grounded Search ---
export const generateWithGoogleSearch = async (prompt: string): Promise<GenerateContentResponse> => {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          tools: [{googleSearch: {}}],
        },
     });
    return response;
};

// --- JSON Output ---
export const generateJson = async (prompt: string): Promise<GenerateContentResponse> => {
    const response = await ai.models.generateContent({
       model: "gemini-2.5-flash",
       contents: prompt,
       config: {
         responseMimeType: "application/json",
         responseSchema: {
            type: Type.OBJECT,
            properties: {
              response: {
                type: Type.STRING,
                description: 'The response to the user prompt.',
              },
            },
          },
       },
    });
    return response;
};


// --- Chat ---
export const startChat = (): Chat => {
    activeChat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
          systemInstruction: 'You are a helpful and creative assistant.',
        },
    });
    return activeChat;
};

export const sendMessageInChat = async (message: string): Promise<GenerateContentStreamResult> => {
    if (!activeChat) {
        startChat();
    }
    const responseStream = await activeChat!.sendMessageStream({ message });
    return responseStream;
};


// --- Speech Generation (TTS) ---
export const generateSpeech = async (text: string, voice: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: ['AUDIO'],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: voice },
        },
      },
    },
  });

  const data = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!data) {
      const errorText = response.text; // Check if there's an error message in the text response
      throw new Error(errorText || "No audio data returned from API.");
  }
  return `data:audio/wav;base64,${data}`;
};

// --- Video Generation ---
export async function* generateVideo(prompt: string, aspectRatio: string, negativePrompt?: string) {
    try {
        yield { status: 'Starting video generation...', progress: 10 };

        const config: any = { aspectRatio };
        if (negativePrompt && negativePrompt.trim() !== '') {
            config.negativePrompt = negativePrompt;
        }

        let operation = await ai.models.generateVideos({
            model: "veo-3.0-generate-preview",
            prompt: prompt,
            config: config,
        });

        yield { status: 'Video generation initiated. Polling for completion...', progress: 30 };

        while (!operation.done) {
            await new Promise((resolve) => setTimeout(resolve, 10000)); // Poll every 10s
            operation = await ai.operations.getVideosOperation({ operation });
            yield { status: 'Polling video status...', progress: 50 + Math.floor(Math.random() * 20) };
        }

        if (operation.error) {
            throw new Error(`Video generation failed: ${operation.error.message || 'Unknown error'}`);
        }
        
        yield { status: 'Video generated. Preparing for playback...', progress: 90 };

        const videoFile = operation.response.generatedVideos[0].video;

        const downloadResult = await ai.files.download({ file: videoFile });
        const videoBlob = await downloadResult.blob();
        
        const videoUrl = URL.createObjectURL(videoBlob);
        
        yield { status: 'done', url: videoUrl, progress: 100 };

    } catch (e: any) {
        console.error("Video generation service failed:", e);
        yield { status: 'error', error: e.message };
    }
}
