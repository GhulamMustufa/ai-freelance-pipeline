import { ImapFlow } from 'imapflow';
import { simpleParser } from 'mailparser';
import * as dotenv from 'dotenv';
import path from 'path';
import { OpportunityPipeline } from '../application/pipeline/OpportunityPipeline';
import { Platform } from '../domain/models';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_PASS = process.env.GMAIL_PASS;

if (!GMAIL_USER || !GMAIL_PASS) {
  console.error("❌ Missing GMAIL_USER or GMAIL_PASS in .env");
  process.exit(1);
}

const pipeline = new OpportunityPipeline();

async function startListener() {
  const client = new ImapFlow({
    host: 'imap.gmail.com',
    port: 993,
    secure: true,
    auth: { user: GMAIL_USER!, pass: GMAIL_PASS! },
    logger: false
  });

  console.log('🔄 Connecting to Gmail IMAP (Ingestion Worker)...');
  await client.connect();
  console.log('✅ Connected. Waiting for Job Alerts...');

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
          const platformId = match[0];
          console.log(`✨ Found Job ID: ${platformId}`);
          
          // Trigger pipeline async
          pipeline.processJob({
            platform: Platform.UPWORK,
            platformId,
            title: msg.envelope?.subject || 'Extracted Job',
            description: parsed.text || '', // Ideally parsed better
            postedAt: msg.envelope?.date || new Date(),
            skills: [] // Ideally extracted
          }).catch(e => console.error('Pipeline processing failed:', e));
          
        }
      }
    };

    // 1. Fetch unread
    try {
      const searchRes = await client.search({ seen: false, from: 'upwork.com' });
      if (searchRes && searchRes.length > 0) {
        for await (const msg of client.fetch(searchRes, { source: true, envelope: true })) {
          await processMessage(msg);
          await client.messageFlagsAdd({ seq: msg.seq }, ['\\Seen']);
        }
      }
    } catch(err) {
      console.log('⚠️ Error searching for missed emails:', (err as Error).message);
    }

    // 2. Listen
    client.on('exists', async (data) => {
      try {
        for await (const msg of client.fetch(data.count.toString(), { source: true, envelope: true })) {
          await processMessage(msg);
        }
      } catch (err) {
        console.error('Error fetching new message:', err);
      }
    });

    console.log('📡 IDLE mode active. Press Ctrl+C to exit.');
    const keepAlive = setInterval(() => {}, 60000);
    
    await new Promise((resolve, reject) => {
      client.on('error', (err) => { clearInterval(keepAlive); reject(err); });
      client.on('close', () => { clearInterval(keepAlive); reject(new Error('Connection closed')); });
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
      console.error("❌ IMAP Listener crashed. Reconnecting in 10s...", (err as Error).message);
      await new Promise(resolve => setTimeout(resolve, 10000));
    }
  }
}

if (require.main === module) {
  main();
}
