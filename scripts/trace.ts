import { prisma } from '../src/lib/prisma';
import { format } from 'date-fns';

async function trace(opportunityId: string) {
  const opportunity = await prisma.opportunity.findUnique({
    where: { id: opportunityId },
    include: {
      jobPosting: true,
      pipelineRuns: { orderBy: { createdAt: 'asc' } },
      agentRuns: { orderBy: { createdAt: 'asc' } }
    }
  });

  if (!opportunity) {
    console.error(`Opportunity ${opportunityId} not found.`);
    process.exit(1);
  }

  console.log(`\n======================================================`);
  console.log(`🔍 EXECUTION TRACE: ${opportunity.jobPosting?.title || opportunityId}`);
  console.log(`======================================================\n`);

  for (const run of opportunity.pipelineRuns) {
    const time = format(run.createdAt, 'HH:mm:ss');
    const stagePad = run.stage.padEnd(16, ' ');
    
    let statusText = run.status;
    if (run.status === 'COMPLETED') {
      const ms = run.completedAt && run.startedAt ? run.completedAt.getTime() - run.startedAt.getTime() : 0;
      statusText = `\x1b[32mCompleted\x1b[0m (${ms}ms)`;
    } else if (run.status === 'FAILED') {
      statusText = `\x1b[31mFailed\x1b[0m: ${run.error}`;
    }

    console.log(`[${time}] ${stagePad} - ${statusText}`);

    // If there were agent runs that occurred around this time (roughly matching the stage), print them
    // For simplicity, we just print AgentRuns inline based on timing
    // Alternatively, we can just list AgentRuns below
  }

  console.log(`\n🤖 AGENT EXECUTIONS\n`);
  for (const agentRun of opportunity.agentRuns) {
    const time = format(agentRun.createdAt, 'HH:mm:ss');
    const namePad = agentRun.agentName.padEnd(20, ' ');
    const modelPad = agentRun.model.padEnd(15, ' ');
    const duration = agentRun.durationMs ? `${agentRun.durationMs}ms` : 'unknown ms';
    const tokens = agentRun.promptTokens && agentRun.completionTokens ? (agentRun.promptTokens + agentRun.completionTokens) : '0';
    
    let statusText = `\x1b[32mSuccess\x1b[0m`;
    if (agentRun.error) {
      statusText = `\x1b[31mError\x1b[0m: ${agentRun.error}`;
    } else if (agentRun.retries > 0) {
      statusText = `\x1b[33mRetried ${agentRun.retries}x\x1b[0m`;
    }

    console.log(`[${time}] ${namePad} | ${modelPad} | ${duration.padEnd(8, ' ')} | Tokens: ${tokens.toString().padEnd(5, ' ')} | ${statusText}`);
  }
  
  console.log(`\n======================================================\n`);
}

const id = process.argv[2];
if (!id) {
  console.log('Usage: npx tsx scripts/trace.ts <opportunityId>');
  process.exit(1);
}

trace(id).catch(console.error);
