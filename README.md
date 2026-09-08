# YouTube Transcoder

Upload a video, get HLS streams in 360p / 720p / 1080p with hover thumbnails.

## Stack

- **Web** — Next.js (`apps/web`)
- **API** — Express, uploads + serving (`apps/api`)
- **Worker** — FFmpeg transcoding + thumbnails (`apps/worker`)
- **DB** — Neon Postgres + Drizzle (`packages/db`)
- **Queue** — BullMQ + Upstash Redis (`packages/queue`)

## Setup

```sh
pnpm install
```

Create a `.env` in the repo root:

```
DATABASE_URL=postgresql://...
REDIS_URL=rediss://...
```

Push the schema:

```sh
cd packages/db && npx drizzle-kit push
```

FFmpeg binaries are bundled in `tools/ffmpeg/bin` — nothing to install. (Or set `FFMPEG_PATH` to use your own.)

## Run

```sh
pnpm dev
```

- Web: http://localhost:3000
- API: http://localhost:4000

## How It Works

1. Upload at `/upload`
2. Worker generates thumbnail sprite + VTT
3. Transcodes to HLS (360p / 720p / 1080p)
4. Watch at `/videos/{id}`, delete via the ⋮ menu
