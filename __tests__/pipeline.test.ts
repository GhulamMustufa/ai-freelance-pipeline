import test from 'node:test';
import assert from 'node:assert';
import { OpportunityPipeline } from '../src/application/pipeline/OpportunityPipeline';
import { Platform } from '../src/domain/models';

test('OpportunityPipeline should initialize correctly', (t) => {
  const pipeline = new OpportunityPipeline();
  assert.ok(pipeline, 'Pipeline instantiated successfully');
});

test('RawOpportunityPayload type check mock', () => {
  const payload = {
    platform: Platform.UPWORK,
    platformId: 'test-123',
    title: 'Test Job',
    description: 'Description',
    postedAt: new Date(),
    skills: ['React']
  };
  
  assert.strictEqual(payload.platformId, 'test-123');
});
