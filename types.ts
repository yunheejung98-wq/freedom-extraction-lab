
export interface ExtractionProtocol {
  phValue: number;
  sentiment: string;
  dominantEmotion: string;
  extractedColorHex: string;
  bottles: {
    id: number;
    description: string;
    ratio: string;
    order: number;
  }[];
  instructions: string;
}

export type AppState = 'IDLE' | 'INPUTTING' | 'ANALYZING' | 'RESULT';

export interface MemoryData {
  text: string;
  prompt: string;
}
