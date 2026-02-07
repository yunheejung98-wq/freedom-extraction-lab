
import { GoogleGenAI, Type } from "@google/genai";
import { ExtractionProtocol } from "../types";

export const analyzeMemory = async (memoryText: string): Promise<ExtractionProtocol> => {
  // Vite 환경에서는 import.meta.env를 사용하거나 vite.config.ts의 define을 통해 주입받습니다.
  const apiKey = (import.meta as any).env?.VITE_API_KEY || process.env.API_KEY;
  
  const ai = new GoogleGenAI({ apiKey: apiKey as string });
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `
      Analyze the following memory about 'freedom' for its emotional chemical properties in an extraction lab context.
      
      MEMORY OF FREEDOM: "${memoryText}"
      
      Bottle Reference System (1 to 5):
      - Bottle 1 & 2: Represents negative/heavy states related to freedom (Anxiety about loss of freedom, tension, entrapment, pain, sadness). 1 is the most intense negative state.
      - Bottle 3: Represents neutral states of freedom (Daily independence, nostalgia, calm observation).
      - Bottle 4 & 5: Represents positive/liberating states (Happiness, Peace, Stability, Acceptance, Pure Joy, Absolute Liberation). 5 is the most intense positive state.
      
      Guidelines:
      1. Map the emotion to a pH scale (1.0 to 14.0).
      2. Select two or three appropriate bottles from the 1-5 range that best synthesize this specific 'freedom' memory.
      3. Create a specific mixing protocol instruction in English like: "Mix Bottle X and Bottle Y in a A:B ratio." 
      
      Provide the result in JSON format including:
      1. phValue: Float (1.0 to 14.0)
      2. sentiment: A short descriptive phrase of the emotional state of this freedom memory.
      3. dominantEmotion: One core emotion (e.g., 'Liberation', 'Anxiety', 'Serenity').
      4. extractedColorHex: A hex color code (used only for internal reference, UI will hide it).
      5. bottles: An array of steps using bottles 1-5.
      6. instructions: The mixing instruction string in the format "Mix Bottle X and Bottle Y in A:B ratio."
    `,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          phValue: { type: Type.NUMBER },
          sentiment: { type: Type.STRING },
          dominantEmotion: { type: Type.STRING },
          extractedColorHex: { type: Type.STRING },
          bottles: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.INTEGER },
                description: { type: Type.STRING },
                ratio: { type: Type.STRING },
                order: { type: Type.INTEGER }
              },
              required: ["id", "description", "ratio", "order"]
            }
          },
          instructions: { type: Type.STRING }
        },
        required: ["phValue", "sentiment", "dominantEmotion", "extractedColorHex", "bottles", "instructions"]
      }
    }
  });

  return JSON.parse(response.text);
};
