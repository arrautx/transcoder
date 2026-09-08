# YouTube Transcoder

Upload a video, get HLS streams in multiple qualities (360p, 720p, 1080p) with hover thumbnails.

## Stack

- **Web** — Next.js + @videojs/react player
- **API** — Express (file upload + serving)
- **Worker** — FFmpeg transcoding + thumbnail generation
- **DB** — PostgreSQL + Drizzle ORM
- **Queue** — BullMQ-style job queue

## Prerequisites

- Node.js
- pnpm
- Docker (for Postgres)
- FFmpeg & ffprobe

## Setup

1. Install dependencies

```sh
pnpm install
```

2. Start Postgres

```sh
docker run --name some-postgres -e POSTGRES_PASSWORD=mysecretpassword -p 5432:5432 -d postgres
```

3. Push the database schema

```sh
cd packages/db && npx drizzle-kit push
```

4. Create a `.env` in `packages/db/`

```
DATABASE_URL=postgresql://postgres:mysecretpassword@localhost:5432/postgres
```

## Run

Start everything:

```sh
pnpm dev
```

- Web: http://localhost:3000
- API: http://localhost:4000

## How It Works

1. Upload a video at `/upload`
2. Worker picks it up, generates thumbnail sprites + VTT
3. Transcodes to HLS (360p / 720p / 1080p)
4. Watch at `/videos/{id}`
