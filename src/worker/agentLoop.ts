import { prisma } from '../lib/prisma';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });


const ORG_UID = "853342360878370817"; // The user's org UID

// Helper to delay
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
  console.log("🤖 Agent Loop Started. Waiting for pending jobs...");

  while (true) {
    try {
      // Find pending jobs
      const pendingJobs = await prisma.job.findMany({
        where: { title: 'Pending Fetch from MCP...' },
      });

      if (pendingJobs.length > 0) {
        console.log(`\n🔍 Found ${pendingJobs.length} pending job(s). Spinning up Upwork MCP...`);

        // Connect to Upwork MCP
        const transport = new StdioClientTransport({
          command: 'npx',
          args: ['mcp-remote', 'https://mcp.upwork.com/mcp']
        });

        const mcpClient = new Client(
          { name: "antigravity-agent-loop", version: "1.0.0" },
          { capabilities: {} }
        );

        await mcpClient.connect(transport);
        console.log("🔌 Connected to Upwork MCP.");

        for (const job of pendingJobs) {
          console.log(`📡 Fetching deep metrics for job: ${job.id}`);
          
          try {
            const result = await mcpClient.callTool({
              name: "upwork__find_jobs",
              arguments: {
                action: "get",
                org_uid: ORG_UID,
                params: { id: job.id }
              }
            });

            // Extract the text
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const textContent = (result.content as any).find((c: any) => c.type === 'text')?.text;
            if (!textContent) {
              console.error(`❌ No text content returned from MCP for ${job.id}`);
              continue;
            }

            // Parse the JSON
            const jobData = JSON.parse(textContent);
            const jobPosting = jobData.job || jobData; // Depending on exact schema
            
            // Extract the fields for the scoring API
            const payload = {
              jobId: job.id,
              title: jobPosting.title || 'Unknown Title',
              description: jobPosting.description || '',
              budget: jobPosting.budget ? `$${jobPosting.budget}` : 'Unknown',
              clientTotalSpend: jobPosting.client_record?.total_spent || 0,
              clientAvgHourlyRate: jobPosting.client_record?.avg_hourly_rate || 0,
              clientFeedbackScore: jobPosting.client_record?.feedback_score || 0,
              clientTotalContracts: jobPosting.client_record?.hires || 0,
              jobInvitesSent: jobPosting.invites_sent || 0,
              jobInterviewing: jobPosting.interviewing || 0,
              jobAvgBid: jobPosting.avg_bid || 0,
            };

            // Extract client info and generate pseudo-hash if no ID exists
            const rawCompanyId = jobPosting.client_record?.company_id || jobPosting.client_record?.id;
            const pseudoHash = Buffer.from(`${jobPosting.client_record?.location?.country || 'Unknown'}-${payload.clientTotalSpend}-${payload.clientTotalContracts}`).toString('base64');
            const clientId = rawCompanyId ? String(rawCompanyId) : pseudoHash;
            
            // Upsert the client
            const clientRecord = await prisma.client.upsert({
              where: { id: clientId },
              update: {
                totalSpend: payload.clientTotalSpend,
                avgHourlyRate: payload.clientAvgHourlyRate,
                feedbackScore: payload.clientFeedbackScore,
                location: jobPosting.client_record?.location?.country
              },
              create: {
                id: clientId,
                totalSpend: payload.clientTotalSpend,
                avgHourlyRate: payload.clientAvgHourlyRate,
                feedbackScore: payload.clientFeedbackScore,
                location: jobPosting.client_record?.location?.country
              }
            });

            if (clientRecord.status === 'BLACKLISTED') {
              console.log(`🚫 Client ${clientId} is BLACKLISTED. Instantly rejecting job ${job.id}.`);
              await prisma.job.update({
                where: { id: job.id },
                data: {
                  title: payload.title,
                  description: payload.description,
                  clientId: clientRecord.id,
                  score: 0,
                  reason: 'Auto-rejected: Client is Blacklisted.',
                  isGolden: false
                }
              });
              continue; // Skip AI scoring!
            }

            // Update the DB immediately to link client
            await prisma.job.update({
              where: { id: job.id },
              data: {
                title: payload.title,
                description: payload.description,
                clientId: clientRecord.id
              }
            });

            console.log(`✅ Fetched successfully. Sending to AI Scorer (Client Status: ${clientRecord.status})...`);
            
            // Pass client status to the scoring API so it can boost Favorites
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (payload as any).clientStatus = clientRecord.status;
            
            // POST to Next.js Scoring API
            const scoreRes = await fetch('http://localhost:3000/api/ai/score', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            });

            if (scoreRes.ok) {
              const scoreData = await scoreRes.json();
              console.log(`🧠 AI Scored Job ${job.id}: ${scoreData.result?.recommendation} (${scoreData.result?.skillMatch}/100)`);
            } else {
              console.error(`❌ AI Scoring failed for ${job.id}: ${scoreRes.statusText}`);
            }

          } catch (jobErr) {
            console.error(`❌ Error processing job ${job.id}:`, jobErr);
          }
        }

        // Close the MCP connection when done with this batch
        await transport.close();
        console.log("🔌 Closed Upwork MCP connection.");
      }

    } catch (err) {
      console.error("❌ Agent Loop Error:", err);
    }

    // Wait 60 seconds before checking again (so we don't spam the DB)
    await sleep(60000);
  }
}

main();
