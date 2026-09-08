import { AIProviderName } from './provider';

export interface ModelPricing {
  provider: AIProviderName;
  model: string;
  costPer1kInputTokens: number;
  costPer1kOutputTokens: number;
}

export const MODEL_PRICING: Record<string, ModelPricing> = {
  'gpt-4o-mini': {
    provider: 'openai',
    model: 'gpt-4o-mini',
    costPer1kInputTokens: 0.00015,
    costPer1kOutputTokens: 0.0006,
  },
  'gpt-4o': {
    provider: 'openai',
    model: 'gpt-4o',
    costPer1kInputTokens: 0.0025,
    costPer1kOutputTokens: 0.010,
  },
  'deepseek-chat': {
    provider: 'deepseek',
    model: 'deepseek-chat',
    costPer1kInputTokens: 0.00014,
    costPer1kOutputTokens: 0.00028,
  },
  'deepseek-reasoner': {
    provider: 'deepseek',
    model: 'deepseek-reasoner',
    costPer1kInputTokens: 0.00055,
    costPer1kOutputTokens: 0.00219,
  }
};

export function calculateCost(model: string, inputTokens?: number, outputTokens?: number): number | undefined {
  const pricing = MODEL_PRICING[model];
  if (!pricing) return undefined;

  const inputCost = (inputTokens || 0) * pricing.costPer1kInputTokens / 1000;
  const outputCost = (outputTokens || 0) * pricing.costPer1kOutputTokens / 1000;
  
  return inputCost + outputCost;
}
