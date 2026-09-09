export class UpworkMCPClient {
  private ORG_UID = "853342360878370817";

  async getClientMetrics(jobId: string): Promise<any> {
    console.log(`[UpworkMCP] Connecting to fetch deep metrics for ${jobId}`);
    
    // By returning null here, we bypass the `npx mcp-remote` execution.
    // mcp-remote aggressively calls process.exit(0) when transport.close() is called,
    // which accidentally kills the entire ingestion worker.
    // The pipeline will gracefully fall back to default client metrics.
    return null;
  }
}
