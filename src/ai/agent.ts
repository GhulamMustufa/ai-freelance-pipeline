import { AIProvider, AIProviderConfig } from './provider';
import { prisma } from '../lib/prisma';
import { z } from 'zod';

export interface ExecuteOptions<T> {
  agentName: string;
  opportunityId?: string | null;
  prompt: string;
  schema: z.ZodSchema<T>;
  systemPrompt?: string;
  schemaName?: string;
  schemaDescription?: string;
}

export class AgentExecutor {
  constructor(private config: AIProviderConfig = { provider: 'openai', model: 'gpt-4o-mini' }) {}

  async executeStructured<T>(options: ExecuteOptions<T>): Promise<T> {
    const { agentName, opportunityId = null, prompt, schema, systemPrompt } = options;
    const startTime = Date.now();
    let result: T | null = null;
    let errorStr: string | null = null;
    let usage: any = null;

    try {
      const response = await AIProvider.generateStructuredData<T>(
        this.config,
        prompt,
        schema,
        systemPrompt
      );
      result = response.result;
      usage = response.usage;
      return result;
    } catch (error) {
      errorStr = String(error);
      throw error;
    } finally {
      const durationMs = Date.now() - startTime;
      
      // Fire and forget telemetry
      prisma.agentRun.create({
        data: {
          opportunityId,
          agentName,
          provider: this.config.provider,
          model: this.config.model,
          promptTokens: usage?.promptTokens,
          completionTokens: usage?.completionTokens,
          durationMs,
          inputPayload: JSON.stringify({ prompt, systemPrompt }),
          outputPayload: result ? JSON.stringify(result) : null,
          error: errorStr
        }
      }).catch(console.error);
    }
  }
}
