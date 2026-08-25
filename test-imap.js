require('dotenv').config();
const { ImapFlow } = require('imapflow');
const client = new ImapFlow({ host: 'imap.gmail.com', port: 993, secure: true, auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_PASS }, logger: false });
async function run() {
  await client.connect();
  let lock = await client.getMailboxLock('INBOX');
  try {
    for await (let msg of client.fetch({ unseen: true }, { envelope: true })) {
      console.log(msg);
    }
  } catch(e) {
    console.error("ERROR", e.message);
  } finally {
    lock.release();
    client.close();
  }
}
run();
