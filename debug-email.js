require('dotenv').config();
const { ImapFlow } = require('imapflow');
const { simpleParser } = require('mailparser');
const fs = require('fs');
const client = new ImapFlow({ host: 'imap.gmail.com', port: 993, secure: true, auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_PASS }, logger: false });
async function run() {
  await client.connect();
  let lock = await client.getMailboxLock('INBOX');
  try {
    const searchRes = await client.search({ unseen: true, from: 'upwork.com' });
    if (searchRes.length > 0) {
      for await (let msg of client.fetch(searchRes[0], { source: true, envelope: true })) {
        console.log("SUBJECT:", msg.envelope.subject);
        const parsed = await simpleParser(msg.source);
        fs.writeFileSync('email_text.txt', parsed.text || '');
        fs.writeFileSync('email_html.txt', parsed.html || '');
        console.log("Saved to email_text.txt and email_html.txt");
        break;
      }
    }
  } finally {
    lock.release();
    client.close();
  }
}
run();
