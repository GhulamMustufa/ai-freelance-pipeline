import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

export class UpworkMCPClient {
  private ORG_UID = "853342360878370817";

  async getClientMetrics(jobId: string): Promise<any> {
    console.log(`[UpworkMCP] Connecting to fetch deep metrics for ${jobId}`);
    
    // In a real app we might pool these connections, but for local pipeline we spawn
    const transport = new StdioClientTransport({
      command: 'npx',
      args: ['mcp-remote', 'https://mcp.upwork.com/mcp']
    });

    const mcpClient = new Client(
      { name: "antigravity-agent-loop", version: "1.0.0" },
      { capabilities: {} }
    );

    try {
      // Add timeout to connection
      const connectPromise = mcpClient.connect(transport);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('MCP Connection Timeout')), 10000)
      );
      
      await Promise.race([connectPromise, timeoutPromise]);

      const result = await mcpClient.callTool({
        name: "upwork__find_jobs",
        arguments: {
          action: "get",
          org_uid: this.ORG_UID,
          params: { id: jobId }
        }
      });

      // Extract the text
      const textContent = (result.content as any).find((c: any) => c.type === 'text')?.text;
      if (!textContent) {
        throw new Error(`No text content returned from MCP for ${jobId}`);
      }

      const jobData = JSON.parse(textContent);
      const jobPosting = jobData.job || jobData; 
      
      return jobPosting.client_record || {};
      
    } catch (e) {
      console.warn(`[UpworkMCP] Failed to fetch metrics: ${e}`);
      return null;
    } finally {
      await transport.close().catch(() => {});
    }
  }
}
