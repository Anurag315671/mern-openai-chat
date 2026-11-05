<<<<<<< HEAD
# Orbit — ChatGPT Clone (MERN + OpenAI)

A full-stack AI chat application built with **MongoDB, Express, React, Node.js, and the OpenAI API**. It includes persistent conversation history, a responsive chat UI, Markdown rendering, and server-side API key handling.

## Features

- Chat with an OpenAI model using the official JavaScript SDK and the **Responses API**.
- Store conversations and messages in MongoDB.
- Browse, create, and delete conversations.
- Preserve recent chat context for follow-up questions.
- Render assistant replies with Markdown, tables, and code blocks.
- Responsive dark interface with a mobile sidebar.
- Loading states, copy-response action, request validation, rate limiting, Helmet, and CORS configuration.

## Requirements

- Node.js 20 or newer
- npm 10 or newer
- MongoDB running locally or a MongoDB Atlas connection string
- An OpenAI API key with access to the model configured below

## Quick start

### 1. Install dependencies

From the project root:

```bash
npm install
```

### 2. Configure the backend

Copy `server/.env.example` to `server/.env` and set your MongoDB connection string and OpenAI API key:

```env
PORT=5000
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:5173
MONGODB_URI=mongodb://127.0.0.1:27017/mern_openai_chat
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-5.5
```

Use a model available to your OpenAI project. You can change `OPENAI_MODEL` without changing source code. **Never put your OpenAI key in the React app or a `VITE_` variable.**

### 3. Configure the frontend (optional)

The Vite development proxy already sends `/api` requests to `http://localhost:5000`. Usually no frontend environment file is needed. To override it, copy `client/.env.example` to `client/.env` and set `VITE_API_URL`.

### 4. Start the app

Make sure MongoDB is running, then from the project root:

```bash
npm run dev
```

Open **http://localhost:5173**. The API runs on **http://localhost:5000**.

Check the backend health endpoint at `http://localhost:5000/api/health`.

## Project structure

```text
mern-openai-chat/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Message.jsx
│   │   │   └── Sidebar.jsx
│   │   ├── lib/api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── server/
│   ├── src/
│   │   ├── middleware/errorHandler.js
│   │   ├── models/Conversation.js
│   │   ├── routes/conversations.js
│   │   ├── services/openai.js
│   │   ├── config.js
│   │   └── index.js
│   ├── .env.example
│   └── package.json
├── .gitignore
├── package.json
└── README.md
```

## API endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | API and database health |
| `GET` | `/api/conversations` | List recent conversations |
| `POST` | `/api/conversations` | Create an empty conversation |
| `GET` | `/api/conversations/:id` | Get a conversation and its messages |
| `DELETE` | `/api/conversations/:id` | Delete a conversation |
| `POST` | `/api/conversations/:id/messages` | Save a user message and generate an assistant reply |

Example message request:

```json
{
  "content": "Explain the MERN stack in simple terms."
}
```

## Production build

Build the React frontend:

```bash
npm run build
```

The generated frontend files are written to `client/dist`. Configure your production hosting to serve that directory and run the Express API separately, or add a static-file serving layer to Express. Set `CLIENT_ORIGIN` to the deployed frontend origin and use a production MongoDB URI.

## Important production notes

This is a learning project starter, not a complete multi-user production service. Before exposing it publicly, add authentication and per-user conversation ownership, use HTTPS, configure trusted proxy settings if deployed behind a reverse proxy, and consider per-account quotas. The current rate limit is IP-based and conversations are not private to individual accounts.

The server sends the recent 40 messages as context. User messages are capped at 12,000 characters. OpenAI response storage is disabled (`store: false`); the app stores chat messages in your MongoDB database.

## Troubleshooting

- **Missing environment variables:** verify `server/.env` exists and contains `MONGODB_URI` and `OPENAI_API_KEY`.
- **MongoDB connection error:** start MongoDB or verify your Atlas URI and network access rules.
- **OpenAI request error:** verify the key, billing/project access, and that `OPENAI_MODEL` is enabled for your account.
- **Frontend cannot reach API:** run both workspaces with `npm run dev`; check that the server uses port `5000` and Vite uses `5173`.

## License

MIT
=======
# mern-openai-chat
>>>>>>> cfbeb9ebacacc09acf7ac4955712862303e4ec18
