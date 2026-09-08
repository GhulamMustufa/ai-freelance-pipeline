import { AIProviderConfig, AIProviderName } from './provider';

export enum TaskType {
  EXTRACTION = 'EXTRACTION',     // Fast, simple parsing
  REASONING = 'REASONING',       // Complex analysis, multi-variable decisions
  GENERATION = 'GENERATION',     // Creative, long-form output
}

export interface RouteRequest {
  type: TaskType;
  complexity?: 'LOW' | 'HIGH';
  costPreference?: 'CHEAP' | 'BALANCED' | 'BEST';
}

export interface RouteDecision {
  primary: AIProviderConfig;
  fallbacks: AIProviderConfig[];
}

export class ModelRouter {
  
  static route(request: RouteRequest): RouteDecision {
    const costPref = request.costPreference || 'BALANCED';
    const complexity = request.complexity || 'LOW';
    
    // Always fallback to opposite provider to avoid systemic outages
    
    if (request.type === TaskType.EXTRACTION) {
      if (costPref === 'BEST' || complexity === 'HIGH') {
        return {
          primary: { provider: 'openai', model: 'gpt-4o' },
          fallbacks: [{ provider: 'deepseek', model: 'deepseek-chat' }]
        };
      }
      return {
        primary: { provider: 'openai', model: 'gpt-4o-mini' },
        fallbacks: [{ provider: 'deepseek', model: 'deepseek-chat' }]
      };
    }
    
    if (request.type === TaskType.REASONING) {
      if (costPref === 'CHEAP') {
        return {
          primary: { provider: 'deepseek', model: 'deepseek-chat' },
          fallbacks: [{ provider: 'openai', model: 'gpt-4o-mini' }]
        };
      }
      return {
        primary: { provider: 'openai', model: 'gpt-4o' },
        fallbacks: [
          { provider: 'deepseek', model: 'deepseek-chat' },
          { provider: 'openai', model: 'gpt-4o-mini' } // Degradation fallback
        ]
      };
    }
    
    if (request.type === TaskType.GENERATION) {
      if (costPref === 'CHEAP') {
        return {
          primary: { provider: 'openai', model: 'gpt-4o-mini' },
          fallbacks: [{ provider: 'deepseek', model: 'deepseek-chat' }]
        };
      }
      return {
        primary: { provider: 'deepseek', model: 'deepseek-chat' },
        fallbacks: [{ provider: 'openai', model: 'gpt-4o' }]
      };
    }

    // Default catch-all
    return {
      primary: { provider: 'openai', model: 'gpt-4o-mini' },
      fallbacks: [{ provider: 'deepseek', model: 'deepseek-chat' }]
    };
  }
}
