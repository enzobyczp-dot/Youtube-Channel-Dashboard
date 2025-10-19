import { GoogleGenAI, Type } from '@google/genai';
import { Scene } from '../types';
import { blobToBase64 } from '../utils/videoUtils';

// Module-level state for API keys and rotation
let apiKeys: string[] = [];
let currentKeyIndex = 0;

/**
 * Updates the list of API keys available to the service.
 * @param newKeys - An array of API key strings.
 */
export const updateApiKeys = (newKeys: string[]) => {
    apiKeys = newKeys;
    currentKeyIndex = 0; // Reset index when keys are updated
};

/**
 * Gets the next available API key in a round-robin fashion.
 * @returns The next API key string.
 * @throws An error if no API keys are configured.
 */
const getNextApiKey = (): string => {
    if (apiKeys.length === 0) {
        // This case should be handled by the UI, but we add a safeguard here.
        throw new Error('No API keys have been configured.');
    }
    const key = apiKeys[currentKeyIndex];
    currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length; // Move to the next key for the next call
    return key;
};

/**
 * Validates a single API key by making a lightweight request to the Gemini API.
 * @param key The API key to validate.
 * @returns A promise that resolves to an object indicating if the key is valid and an optional error message.
 */
export const validateApiKey = async (key: string): Promise<{ isValid: boolean; error?: string }> => {
    if (!key || key.trim() === '') {
        return { isValid: false, error: 'Khóa không được để trống.' };
    }
    try {
        const ai = new GoogleGenAI({ apiKey: key });
        // Make a very simple, low-cost request to check for validity
        await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: 'test',
        });
        return { isValid: true };
    } catch (err: any) {
        console.error(`Validation failed for key ending in ...${key.slice(-4)}`, err);
        const errorMessage = err.message?.toLowerCase() || '';
        if (errorMessage.includes('api key not valid')) {
            return { isValid: false, error: 'API Key không hợp lệ.' };
        }
        if (errorMessage.includes('permission denied')) {
            return { isValid: false, error: 'Quyền bị từ chối. Đảm bảo Vertex AI API đã được kích hoạt.' };
        }
        if (errorMessage.includes('quota')) {
            return { isValid: false, error: 'Key đã đạt đến giới hạn hạn ngạch.' };
        }
        return { isValid: false, error: 'Lỗi không xác định. Kiểm tra console để biết chi tiết.' };
    }
};


/**
 * Generates a multi-scene video script from a user-provided idea using Gemini.
 * @param idea - A string describing the story idea.
 * @returns A promise that resolves to an array of Scene objects.
 */
export const generateStoryFromPrompt = async (idea: string): Promise<Scene[]> => {
    const apiKey = getNextApiKey();
    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Create a short video script based on this idea: "${idea}". The video should have between 2 and 5 scenes. For each scene, provide a detailed visual prompt for an AI video generator and a duration in seconds (integer between 3 and 10). The total video duration should not exceed 45 seconds.`,
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    scenes: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                prompt: {
                                    type: Type.STRING,
                                    description: 'A detailed visual description for the video generation model to create this scene.'
                                },
                                duration: {
                                    type: Type.NUMBER,
                                    description: 'The duration of this scene in seconds (integer between 3 and 10).'
                                }
                            },
                            required: ['prompt', 'duration']
                        }
                    }
                },
                required: ['scenes']
            }
        }
    });

    const jsonText = response.text.trim();
    const result = JSON.parse(jsonText);
    
    return result.scenes.map((scene: Omit<Scene, 'id'>, index: number) => ({
        ...scene,
        id: `scene-${Date.now()}-${Math.random()}`,
        transition: index > 0 ? 'Fade in' : 'None',
    }));
};

/**
 * Generates a video for a single scene using the VEO model.
 * @param prompt - The text prompt describing the scene.
 * @param imageFile - An optional image file to provide visual context.
 * @param quality - The desired video quality.
 * @param music - The desired background music style.
 * @param transition - An optional transition effect leading into this scene.
 * @returns A promise that resolves to a local URL (object URL) for the generated video blob.
 */
export const generateVideoForScene = async (prompt: string, imageFile: File | null, quality: 'HD' | 'FHD', music: string, transition?: string): Promise<string> => {
    const apiKey = getNextApiKey();
    const ai = new GoogleGenAI({ apiKey });

    let imagePayload;
    if (imageFile) {
        const base64Image = (await blobToBase64(imageFile)).split(',')[1];
        imagePayload = {
            imageBytes: base64Image,
            mimeType: imageFile.type,
        };
    }

    const qualityPromptEnhancer = quality === 'FHD'
        ? ', cinematic, high detail, sharp focus, 1080p, Full HD'
        : ', 720p, HD';
        
    const musicPromptEnhancer = music && music !== 'None'
        ? `, with a background score of ${music} music`
        : '';

    const transitionPrefix = transition && transition !== 'None'
        ? `Apply the following transition: "${transition}". The scene should then show: `
        : '';

    const finalPrompt = `${transitionPrefix}${prompt}${qualityPromptEnhancer}${musicPromptEnhancer}`;
    
    // FIX: Update model and request parameters to align with current API guidelines for video generation.
    const request: Parameters<typeof ai.models.generateVideos>[0] = {
        model: 'veo-3.1-fast-generate-preview',
        prompt: finalPrompt,
        config: {
            numberOfVideos: 1,
            resolution: quality === 'FHD' ? '1080p' : '720p',
            aspectRatio: '16:9',
        }
    };

    if (imagePayload) {
        request.image = imagePayload;
    }

    let operation = await ai.models.generateVideos(request);

    while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await ai.operations.getVideosOperation({ operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) {
        throw new Error('Video generation failed or did not return a valid download link.');
    }
    
    // Use the same API key for the download request.
    const videoResponse = await fetch(`${downloadLink}&key=${apiKey}`);
    if (!videoResponse.ok) {
        // Check if the error is due to an invalid API key
        if (videoResponse.status === 400 || videoResponse.status === 403) {
             const errorData = await videoResponse.json();
             if (errorData?.error?.message.toLowerCase().includes('api key not valid')) {
                 throw new Error('API key not valid. Please check your API key.');
             }
        }
        throw new Error(`Failed to download the generated video: ${videoResponse.statusText}`);
    }
    const videoBlob = await videoResponse.blob();
    return URL.createObjectURL(videoBlob);
};