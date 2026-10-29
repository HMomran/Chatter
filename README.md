# Chatter

A responsive, full-stack messaging app for real-time, one-to-one conversations.

![Angular](https://img.shields.io/badge/Angular-20-DD0031?style=flat-square&logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=flat-square&logo=express&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.IO-010101?style=flat-square&logo=socketdotio&logoColor=white)

## About

Chatter lets users create an account, find other registered people, and exchange messages instantly. Conversations are saved locally, so message history remains available after reloading or restarting the app.

## Features

- **Account access** — Sign up with a name, phone number, and password; sign in with phone and password. Passwords are hashed with scrypt.
- **People directory** — Search registered users by name or phone number and open a conversation.
- **Real-time messaging** — Exchange text messages through authenticated Socket.IO connections.
- **Conversation history** — Reopen saved conversations with message timestamps.
- **Responsive interface** — Desktop and mobile layouts with form validation, loading states, and error feedback.
- **Session management** — Token-based access to conversations and account sign-out.

## Tech Stack

- **Frontend:** Angular 20, TypeScript, RxJS, HTML, and CSS.
- **Backend:** Node.js, Express, Socket.IO, and Node.js Crypto.
- **Storage:** Local JSON file for accounts and messages; no external database required.

## Getting Started

**Requirements:** Node.js 22.12+ within the Node.js 22 release line, npm, and available ports **3000** and **4200**.

```bash
git clone https://github.com/HMomran/chat.git
cd chat
npm run setup
npm start
```

`npm run setup` installs dependencies for the root, backend, and frontend. `npm start` launches both services.

Open **[localhost:4200](http://localhost:4200)**. The backend runs at **[localhost:3000](http://localhost:3000)**. Press **Ctrl+C** to stop the app.

Create two accounts in separate browser sessions to try a conversation. Data is saved in `backend/data/chat.json`; sign in again after restarting the backend.
