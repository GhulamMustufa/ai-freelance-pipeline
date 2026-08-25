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

async function startListener() {
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

  console.log('🔄 Connecting to Gmail IMAP...');
  await client.connect();
  console.log('✅ Connected. Waiting for Upwork Job Alerts...');

  // Select INBOX
  const lock = await client.getMailboxLock('INBOX');
  
  try {
    const processMessage = async (msg: any) => {
      const fromAddress = msg.envelope?.from?.[0]?.address || '';
      if (fromAddress.includes('upwork.com')) {
        console.log(`🚀 Processing Upwork Email: ${msg.envelope?.subject || 'Unknown Subject'}`);
        
        if (!msg.source) return;
        
        const parsed = await simpleParser(msg.source);
        const body = (parsed.text || '') + ' ' + (parsed.html || '');
        
        const match = body.match(/~[0-9a-zA-Z]+/);
        if (match) {
          const jobId = match[0];
          console.log(`✨ Found Job ID: ${jobId}`);
          
          const existing = await prisma.job.findUnique({ where: { id: jobId } });
          if (!existing) {
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
    };

    // 1. Fetch any unread emails we might have missed while offline
    console.log('🔍 Checking for missed unread Upwork emails...');
    try {
      const searchRes = await client.search({ unseen: true, from: 'upwork.com' });
      if (searchRes && searchRes.length > 0) {
        for await (const msg of client.fetch(searchRes, { source: true, envelope: true })) {
          await processMessage(msg);
          // Mark as seen so we don't process it again on next restart
          await client.messageFlagsAdd({ seq: msg.seq }, ['\\Seen']);
        }
      } else {
        console.log('✅ No missed Upwork emails found.');
      }
    } catch(err) {
      console.log('⚠️ Error searching for missed emails:', (err as Error).message);
    }

    // 2. Listen for new messages in INBOX
    client.on('exists', async (data) => {
      console.log(`📬 New email arrived! (Total messages: ${data.count})`);
      
      try {
        for await (const msg of client.fetch(data.count.toString(), { source: true, envelope: true })) {
          await processMessage(msg);
        }
      } catch (err) {
        console.error('Error fetching new message:', err);
      }
    });

    // Keep the script running
    // The lock holds the INBOX open for IDLE
    console.log('📡 IDLE mode active. Press Ctrl+C to exit.');
    
    // Keep the event loop alive
    const keepAlive = setInterval(() => {}, 60000);
    
    // Listen infinitely, but reject if connection drops so we can reconnect
    await new Promise((resolve, reject) => {
      client.on('error', (err) => {
        clearInterval(keepAlive);
        reject(err);
      });
      client.on('close', () => {
        clearInterval(keepAlive);
        reject(new Error('Connection closed'));
      });
    }); 
    
  } finally {
    lock.release();
  }
}

async function main() {
  while (true) {
    try {
      await startListener();
    } catch (err) {
      console.error("❌ IMAP Listener crashed or dropped connection. Reconnecting in 10s...", (err as Error).message);
      await new Promise(resolve => setTimeout(resolve, 10000));
    }
  }
}

main();
