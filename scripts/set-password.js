// Local administrator tool for accounts created before passwords were added.
const path = require('node:path');
const readline = require('node:readline/promises');
const { Writable } = require('node:stream');
const { createStore } = require('../backend/store');
const { hashPassword } = require('../backend/auth');
async function main() {
  const phone = process.argv[2];
  if (!phone) throw new Error('Usage: node scripts/set-password.js PHONE (stop the backend first)');
  const store = createStore(process.env.DATA_FILE || path.join(__dirname, '../backend/data/chat.json'));
  const user = store.data.customers.find(c => c.phone === phone);
  if (!user) throw new Error('Account not found');
  let hidden = false;
  const output = new Writable({ write(chunk, encoding, callback) { if (!hidden) process.stdout.write(chunk, encoding); callback(); } });
  const rl = readline.createInterface({ input: process.stdin, output, terminal: true });
  process.stdout.write('New password (8–128 characters, hidden): '); hidden = true;
  const password = await rl.question('');
  process.stdout.write('\nConfirm password: ');
  const confirm = await rl.question('');
  rl.close(); process.stdout.write('\n');
  if (password.length < 8 || password.length > 128 || password !== confirm) throw new Error('Passwords must match and contain 8–128 characters');
  user.passwordHash = await hashPassword(password); store.save();
  console.log('Password saved. Restart the backend and sign in. Existing messages are preserved.');
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
