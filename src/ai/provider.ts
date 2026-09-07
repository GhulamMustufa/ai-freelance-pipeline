import { google } from '@ai-sdk/google';
import { openai } from '@ai-sdk/openai';
import { generateObject, generateText, LanguageModel, CoreMessage } from 'ai';
import { z } from 'zod';

export type AIProviderName = 'gemini' | 'openai';

export interface AIProviderConfig {
  provider: AIProviderName;
  model: string;
}

export class AIProvider {
  private static getModel(config: AIProviderConfig): LanguageModel {
    switch (config.provider) {
      case 'gemini':
        return google(config.model);
      case 'openai':
        return openai(config.model);
      default:
        throw new Error(`Unsupported AI Provider: ${config.provider}`);
    }
  }

  static async generateStructuredData<T>(
    config: AIProviderConfig,
    prompt: string,
    schema: z.ZodSchema<T>,
    system?: string
  ): Promise<{ result: T; usage: any }> {
    const model = this.getModel(config);
    
    const { object, usage } = await generateObject({
      model,
      schema,
      prompt,
      system
    });
    
    return { result: object, usage };
  }
  
  static async chat(
    config: AIProviderConfig,
    messages: CoreMessage[],
    system?: string
  ) {
    const model = this.getModel(config);
    
    const { text, usage } = await generateText({
      model,
      messages,
      system
    });
    
    return { text, usage };
  }
}
