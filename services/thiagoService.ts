import { GoogleGenAI } from "@google/genai";
import { THIAGO_SYSTEM_PROMPT } from './thiagoPrompt';

const model = 'gemini-2.5-pro';

// Helper to create a new AI client instance for each request, same as geminiService
const getAIClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Sends a user message to the Thiago AI assistant and returns its response.
 * @param userMessage The message from the user.
 * @param context Optional context about the user's session.
 * @returns A string with Thiago's response or an error message.
 */
export async function askThiago(userMessage: string, context?: { source?: "manual" | "invoices" | null }): Promise<string> {
    try {
        const ai = getAIClient();

        // Construct a prompt that includes the context for the AI model
        let finalUserPrompt = userMessage;
        if (context?.source) {
            finalUserPrompt = `[CONTEXTO DE LA APP]\nsource: "${context.source}"\n\n[MENSAJE DEL USUARIO]\n${userMessage}`;
        }
        
        const response = await ai.models.generateContent({
            model: model,
            contents: finalUserPrompt,
            config: {
                systemInstruction: THIAGO_SYSTEM_PROMPT,
            },
        });
        
        return response.text;

    } catch (error) {
        console.error("Error asking Thiago:", error);
        return "No he podido consultar a Thiago ahora mismo. Inténtalo más tarde.";
    }
}