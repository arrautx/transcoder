import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const UPLOADS_DIR = path.resolve(__dirname, "../../../uploads");

export const getFfmpegArgs = (videoId: string) => {
  const input = path.join(UPLOADS_DIR, videoId);
  const outDir = path.join(UPLOADS_DIR, videoId + "_hls");

  return [
    "-y",
    "-i",
    input,
    "-filter_complex",
    "[0:v]split=3[v360][v720][v1080];[v360]scale=-2:360[out360];[v720]scale=-2:720[out720];[v1080]scale=-2:1080[out1080]",
    "-map",
    "[out360]",
    "-map",
    "0:a?",
    "-c:v",
    "libx264",
    "-preset",
    "fast",
    "-crf",
    "28",
    "-c:a",
    "aac",
    "-hls_time",
    "6",
    "-hls_playlist_type",
    "vod",
    "-hls_segment_filename",
    path.join(outDir, "360p_%03d.ts"),
    path.join(outDir, "360p.m3u8"),
    "-map",
    "[out720]",
    "-map",
    "0:a?",
    "-c:v",
    "libx264",
    "-preset",
    "fast",
    "-crf",
    "23",
    "-c:a",
    "aac",
    "-hls_time",
    "6",
    "-hls_playlist_type",
    "vod",
    "-hls_segment_filename",
    path.join(outDir, "720p_%03d.ts"),
    path.join(outDir, "720p.m3u8"),
    "-map",
    "[out1080]",
    "-map",
    "0:a?",
    "-c:v",
    "libx264",
    "-preset",
    "fast",
    "-crf",
    "20",
    "-c:a",
    "aac",
    "-hls_time",
    "6",
    "-hls_playlist_type",
    "vod",
    "-hls_segment_filename",
    path.join(outDir, "1080p_%03d.ts"),
    path.join(outDir, "1080p.m3u8"),
  ];
};

const THUMB_WIDTH = 160;
const THUMB_HEIGHT = 90;
const TILE_PADDING = 2;
const TILE_MARGIN = 2;
const TILE_COLS = 10;
const TILE_CELL_W = THUMB_WIDTH + TILE_PADDING;
const TILE_CELL_H = THUMB_HEIGHT + TILE_PADDING;
export const THUMB_INTERVAL = 5;

export const getThumbnailArgs = (
  videoId: string,
  duration: number,
): string[] => {
  const input = path.join(UPLOADS_DIR, videoId);
  const outDir = path.join(UPLOADS_DIR, videoId + "_hls");
  const spritePath = path.join(outDir, "thumbnails.jpg");
  const thumbCount = Math.ceil(duration / THUMB_INTERVAL);
  const rows = Math.ceil(thumbCount / TILE_COLS);

  return [
    "-y",
    "-i",
    input,
    "-vf",
    `fps=1/${THUMB_INTERVAL},scale=${THUMB_WIDTH}:${THUMB_HEIGHT},tile=${TILE_COLS}x${rows}:padding=${TILE_PADDING}:margin=${TILE_MARGIN}`,
    "-frames:v",
    "1",
    "-update",
    "1",
    "-q:v",
    "4",
    spritePath,
  ];
};

export const generateThumbnailVtt = (duration: number) => {
  const thumbCount = Math.ceil(duration / THUMB_INTERVAL);
  const rows = Math.ceil(thumbCount / TILE_COLS);

  let vtt = "WEBVTT\n\n";

  for (let i = 0; i < thumbCount; i++) {
    const startTime = i * THUMB_INTERVAL;
    const endTime = Math.min(startTime + THUMB_INTERVAL, duration);
    const col = i % TILE_COLS;
    const row = Math.floor(i / TILE_COLS);

    const x = TILE_MARGIN + col * TILE_CELL_W;
    const y = TILE_MARGIN + row * TILE_CELL_H;

    const startFormatted = formatVttTime(startTime);
    const endFormatted = formatVttTime(endTime);

    vtt += `${startFormatted} --> ${endFormatted}\n`;
    vtt += `thumbnails.jpg#xywh=${x},${y},${THUMB_WIDTH},${THUMB_HEIGHT}\n\n`;
  }

  return vtt;
};

function formatVttTime(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.round((seconds % 1) * 1000);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${String(ms).padStart(3, "0")}`;
}

export const getMasterPlaylist = (videoId: string) => {
  return `#EXTM3U
#EXT-X-STREAM-INF:BANDWIDTH=800000,RESOLUTION=640x360
360p.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=2800000,RESOLUTION=1280x720
720p.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=5000000,RESOLUTION=1920x1080
1080p.m3u8`;
};
