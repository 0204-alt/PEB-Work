# Setup

## Requirements

- Node.js 20+
- PostgreSQL 16 (Docker Compose provided)
- npm 10+

## Environment

```powershell
copy .env.example .env
```

Set `JWT_SECRET` to a long random string. Do not commit `.env`.

## Database

```powershell
docker compose up -d
cd packages\database
npx prisma generate --schema ..\..\prisma\schema.prisma
npx prisma migrate dev --name phase1_domain --schema ..\..\prisma\schema.prisma
npx tsx ..\..\prisma\seed.ts
```

From repo root after `npm install`:

```powershell
npm install
npm run db:generate
```

## Run tests

```powershell
npm run test:core
npm test
```

## Run API / web

API requires `DATABASE_URL` and `JWT_SECRET` in the environment.

```powershell
npm run dev:api
npm run dev:web
```

## V11.9 prototype

Open `legacy/v11.9/index.html` in a browser. It is a frozen baseline, not the production engine.

## STAAD.Pro

Not required for Phase 1. When STAAD export exists, internal validation is not a substitute for opening the file in STAAD.Pro.
