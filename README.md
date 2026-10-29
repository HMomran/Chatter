# Chatter

A local one-to-one chat app built with Angular 20, Express, and Socket.IO. Create an account, find another person, and exchange messages in real time. Conversations are saved locally and restored when you return.

The interface includes a landing page, distinct sign-up/sign-in forms, a searchable people directory, account sign-out, and a responsive conversation view with timestamps and message bubbles.

## Run

Use Node.js 22.12 or newer in the Node 22 release line (tested with 22.23.3), npm, and free ports 3000 and 4200.

```bash
npm run setup
npm start
```

Open http://localhost:4200 after the frontend finishes compiling. Ctrl+C stops both services. No global Angular CLI or MongoDB setup is needed. Installation requires internet access; web fonts fall back to the system sans-serif font when unavailable.

For separate terminals:

```bash
npm --prefix backend start
npm --prefix frontend start
```

Run each command in its own terminal from the repository root.

## Account flows

- **Sign up:** full name, phone number, password, and password confirmation. Passwords must contain 8–128 characters. Phone numbers accept 7–15 digits with an optional leading `+`; spaces, parentheses, and hyphens are removed. Phone numbers are unique.
- **Sign in:** phone number and password only. Name is no longer required.
- **Show/Hide:** toggles password visibility. Forms support browser autofill, inline validation, loading states, and visible request errors.
- **Sign out:** use the arrow beside your account in the people sidebar. It revokes that session and disconnects the account's sockets.
- Phone numbers identify accounts but are not verified by SMS. There is no email or SMS password recovery.

### Accounts created before passwords

Existing accounts and messages are preserved. Old accounts have no password and cannot use the new sign-in until a local administrator sets one. To preserve the old account, stop the app, then run:

```bash
node scripts/set-password.js YOUR_EXISTING_PHONE
```

The tool prompts for a password and confirmation without echoing either. Restart with `npm start`, then sign in. It can also reset a forgotten password when run by the local administrator with access to the data file. Alternatively, create a new account with a different phone; that creates a separate identity and does not transfer old conversations.

Existing browser sessions from the old version need to sign in again. New sessions expire after 24 hours and are invalidated by a backend restart.

## Try it

1. Create an account in one browser window.
2. In a separate browser or incognito session, create a second account with a different phone number.
3. Click **Refresh** on the people page. Search by name/phone or select a person card.
4. Open the other account's conversation in the second window and send messages in either direction.
5. Reload or reopen the conversation to see its saved history.

Session storage keeps the current account per tab; a separate browser session is the clearest way to test two users. The people directory shows registered accounts, not real-time online presence.

## How it works

- `frontend/`: Angular standalone components, reactive account forms, session storage, and Socket.IO client. Shared styling lives in `frontend/src/styles.css`.
- `backend/`: Express REST endpoints and Socket.IO on one HTTP server.
- `backend/auth.js`: passwords are salted and hashed with Node's asynchronous scrypt. Successful registration/login issues a random 24-hour bearer token held in server memory. Password hashes are never returned in API responses.
- HTTP requests for accounts/history require a token. History access is restricted to the signed-in account. Socket handshakes require a token, and the server derives the sender from that session rather than trusting client-supplied IDs.
- Messages are validated, saved, and emitted only to the two participants' account rooms. The client merges history and live messages by message ID.
- `backend/store.js`: accounts and messages are stored in `backend/data/chat.json` using temporary-file replacement. Back up this file to preserve local data. Deleting it while the backend is stopped resets the demo.

The earlier remote MongoDB connection is no longer used; Atlas records are not migrated. Old database credentials may remain in Git history and should be revoked by their owner.

### API

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/` | Backend health |
| POST | `/api/customers` | Register `{ name, phone, password }`; returns `{ customer, token }` |
| POST | `/api/customers/login` | Sign in `{ phone, password }`; returns `{ customer, token }` |
| POST | `/api/customers/logout` | Revoke the current token |
| GET | `/api/customers` | List registered people |
| GET | `/api/customers/:id` | Retrieve a public account profile |
| GET | `/api/messages/customers/:id?peer=OTHER_ID` | Retrieve the signed-in account's conversation |

Protected endpoints use `Authorization: Bearer TOKEN`. The old name-and-phone lookup login endpoints have been removed. Socket connections pass `{ auth: { token } }`. Events are `join` (own account ID), `sendMessage` (`{ receiver, message }` with acknowledgement), and `receiveMessage` (saved message). Text is limited to 4,000 characters.

## Tests and build

```bash
npm test
npm --prefix frontend test -- --watch=false --browsers=ChromeHeadless
npm run build
```

Backend integration coverage includes validation, duplicate accounts, password login, wrong passwords, private delivery, sender identity, unauthorized sockets/history, persistence, and session invalidation after restart. Frontend tests cover sign-in sessions/errors, password confirmation, successful sign-up, and component initialization. Chrome must be installed; set `CHROME_BIN` if it is not automatically detected.

The production frontend is generated in `frontend/dist/frontend/browser`. Hosting Angular routes requires an `index.html` fallback. API/socket URLs currently target `http://localhost:3000`; update those for remote hosting.

Optional backend environment variables: `PORT` (3000), `DATA_FILE` (`backend/data/chat.json`), `FRONTEND_ORIGIN` (`http://localhost:4200`). Changing the port requires updating frontend URLs too.

## Troubleshooting

- **Cannot connect:** keep both services running; http://localhost:3000 should return `{ "status": "ok", ... }`.
- **Session ended after restart:** sign in again. Tokens are intentionally held in memory.
- **Old account rejects login:** follow the local password setup instructions above.
- **Phone already registered:** sign in, reset its password locally, or use another number.
- **Port in use:** stop the earlier process on 3000/4200 before restarting.
- **No people listed:** create another account in a separate session, then refresh.
- **Invalid data file:** restore or repair the JSON rather than deleting existing data unintentionally.

## Current limits and verification

This remains a local demo. The file store supports one backend process and modest data. Public deployment needs HTTPS, login throttling, verified identity/recovery, and a production database. Bearer tokens are stored in session storage, and offline clients recover history by reopening a conversation.

The updated backend integration test, frontend headless Chrome tests, and production build pass. The frontend has 17 npm dependency advisories from the prior audit; compatible updates did not resolve those advisories. Visual inspection through the browser-control tool was unavailable because computer-use permissions were not granted.
