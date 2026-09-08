import { AIProviderConfig, AIProvider } from './provider';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import { calculateCost } from './pricing';
import { ModelRouter, TaskType } from './router';

export interface ExecuteOptions<T> {
  agentName: string;
  opportunityId?: string | null;
  prompt: string;
  schema: z.ZodSchema<T>;
  systemPrompt?: string;
  schemaName?: string;
  schemaDescription?: string;
  promptVersion?: string;
  
  // Routing hints
  taskType?: TaskType;
  complexity?: 'LOW' | 'HIGH';
  costPreference?: 'CHEAP' | 'BALANCED' | 'BEST';
}

export class AgentExecutor {
  // If not injected per-execution, fallback to this
  constructor(private defaultConfig: AIProviderConfig = { provider: 'openai', model: 'gpt-4o-mini' }) {}

  async executeStructured<T>(options: ExecuteOptions<T>): Promise<T> {
    const { agentName, opportunityId = null, prompt, schema, systemPrompt, schemaName, promptVersion = "1.0" } = options;
    const startTime = Date.now();
    let result: T | null = null;
    let errorStr: string | null = null;
    let usage: any = null;
    let retries = 0;
    
    // Resolve routing
    const routeDecision = options.taskType ? ModelRouter.route({
      type: options.taskType,
      complexity: options.complexity,
      costPreference: options.costPreference
    }) : { primary: this.defaultConfig, fallbacks: [] };
    
    const configsToTry = [routeDecision.primary, ...routeDecision.fallbacks];
    let activeConfig = configsToTry[0];

    for (let i = 0; i < configsToTry.length; i++) {
      activeConfig = configsToTry[i];
      try {
        const response = await AIProvider.generateStructuredData<T>(
          activeConfig,
          prompt,
          schema,
          systemPrompt
        );
        result = response.result;
        usage = response.usage;
        break; // Success! Break out of retry loop.
      } catch (error) {
        retries++;
        errorStr = String(error);
        console.warn(`[AgentExecutor] ${agentName} failed with ${activeConfig.model}. Error: ${errorStr}`);
        
        if (i === configsToTry.length - 1) {
          // Final fallback failed
          break; 
        }
        console.log(`[AgentExecutor] Falling back to next config...`);
      }
    }

    const durationMs = Date.now() - startTime;
    const estimatedCost = calculateCost(activeConfig.model, usage?.promptTokens, usage?.completionTokens);
    
    // Fire and forget telemetry
    prisma.agentRun.create({
      data: {
        opportunityId,
        agentName,
        provider: activeConfig.provider,
        model: activeConfig.model,
        schemaVersion: schemaName ?? '1.0',
        promptVersion,
        retries,
        promptTokens: usage?.promptTokens,
        completionTokens: usage?.completionTokens,
        durationMs,
        estimatedCost,
        inputPayload: JSON.stringify({ prompt, systemPrompt }),
        outputPayload: result ? JSON.stringify(result) : null,
        error: !result ? errorStr : null // only log error if we ultimately failed
      }
    }).catch(console.error);

    if (!result) {
      throw new Error(`Agent ${agentName} failed after ${retries} attempts. Final error: ${errorStr}`);
    }

    return result;
  }
}
