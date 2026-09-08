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
    const { agentName, opportunityId = null, prompt, schema, systemPrompt, schemaName } = options;
    const startTime = Date.now();
    let result: T | null = null;
    let errorStr: string | null = null;
    let usage: any = null;
    let retries = 0;

    // A simple retry loop could be implemented here, but for now we just track it.
    // The Proposal drafting agent handles its own logical retries via the while loop,
    // but if the Vercel AI SDK throws an error (e.g. rate limit), we could retry here.
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
          schemaVersion: schemaName ?? '1.0',
          retries,
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
