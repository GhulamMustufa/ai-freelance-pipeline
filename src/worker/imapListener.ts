import { ImapFlow } from 'imapflow';
import { simpleParser } from 'mailparser';
import { prisma } from '../lib/prisma';
import * as dotenv from 'dotenv';
import path from 'path';

// Load .env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });



const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_PASS = process.env.GMAIL_PASS;

if (!GMAIL_USER || !GMAIL_PASS) {
  console.error("❌ Missing GMAIL_USER or GMAIL_PASS in .env");
  console.error("Please generate an App Password in your Google Account: https://myaccount.google.com/apppasswords");
  process.exit(1);
}

const client = new ImapFlow({
  host: 'imap.gmail.com',
  port: 993,
  secure: true,
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_PASS
  },
  logger: false
});

async function main() {
  console.log('🔄 Connecting to Gmail IMAP...');
  await client.connect();
  console.log('✅ Connected. Waiting for Upwork Job Alerts...');

  // Select INBOX
  let lock = await client.getMailboxLock('INBOX');
  
  try {
    // Listen for new messages in INBOX
    client.on('exists', async (data) => {
      console.log(`📬 New email arrived! (Total messages: ${data.count})`);
      
      // Fetch the newest message
      for await (let msg of client.fetch(data.count.toString(), { source: true, envelope: true })) {
        
        // Filter by Upwork
        const fromAddress = msg.envelope?.from?.[0]?.address || '';
        if (fromAddress.includes('upwork.com')) {
          console.log(`🚀 Processing Upwork Email: ${msg.envelope?.subject || 'Unknown Subject'}`);
          
          if (!msg.source) continue;
          
          const parsed = await simpleParser(msg.source);
          const body = parsed.text || '';
          
          // Try to extract the job ID
          // Upwork job URLs usually look like: https://www.upwork.com/jobs/~01xyz123456
          const match = body.match(/~01[a-zA-Z0-9]+/);
          if (match) {
            const jobId = match[0];
            console.log(`✨ Found Job ID: ${jobId}`);
            
            // Deduplicate
            const existing = await prisma.job.findUnique({ where: { id: jobId } });
            if (!existing) {
              // Create a pending job record
              await prisma.job.create({
                data: {
                  id: jobId,
                  title: 'Pending Fetch from MCP...',
                  description: 'Waiting for AI agent to fetch deep metrics...',
                  skills: '',
                  postedAt: new Date(),
                  score: null,
                }
              });
              console.log(`💾 Saved ${jobId} as pending. Agent will fetch deep metrics shortly!`);
            } else {
              console.log(`⏭️ Job ${jobId} already exists in DB.`);
            }
          } else {
            console.log('⚠️ Could not find a Job ID in this email.');
          }
        }
      }
    });

    // Keep the script running
    // The lock holds the INBOX open for IDLE
    console.log('📡 IDLE mode active. Press Ctrl+C to exit.');
    
    // We never release the lock here so it stays listening infinitely
    await new Promise(() => {}); 
    
  } finally {
    lock.release();
  }
}

main().catch(err => {
  console.error("Fatal Error:", err);
  process.exit(1);
});
