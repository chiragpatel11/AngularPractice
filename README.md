# Task app

Angular client, NestJS API, and Postgres. A person registers, logs in, and manages only their own tasks.

## Prerequisites

- Node.js 24 or newer
- Docker Desktop

## Setup

1. Start Postgres:

```bash
docker compose up -d
```

2. Create the API environment file:

```bash
copy server\.env.example server\.env
```

3. Install dependencies, apply the database migration, and start the API:

```bash
cd server
npm install
npx prisma migrate dev
npm run start:dev
```

4. In a second terminal, install dependencies and start the client:

```bash
cd client
npm install
npm start
```

Open http://localhost:4200. The API listens on http://localhost:3000.

Register through the UI. The first account is not seeded. The client stores the JWT in the browser and sends it as a Bearer token. Every task query is limited to the signed-in user.
