import { updateVideoStatus } from "@repo/db";
import queue from "@repo/queue";
import { spawn } from "child_process";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import path from "path";
import {
  generateThumbnailVtt,
  getFfmpegArgs,
  getMasterPlaylist,
  getThumbnailArgs,
  UPLOADS_DIR,
} from "./utils.js";

// Resolve ffmpeg/ffprobe: repo-local tools/ffmpeg/bin → FFMPEG_PATH env → PATH
function resolveBinary(name: string): string {
  const local = path.join(
    UPLOADS_DIR,
    "..",
    "tools",
    "ffmpeg",
    "bin",
    name + (process.platform === "win32" ? ".exe" : ""),
  );
  if (existsSync(local)) return local;

  if (process.env.FFMPEG_PATH) {
    const fromEnv = path.join(
      process.env.FFMPEG_PATH,
      name + (process.platform === "win32" ? ".exe" : ""),
    );
    if (existsSync(fromEnv)) return fromEnv;
  }

  return name; // fall back to PATH
}

function runFfmpeg(args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn(resolveBinary("ffmpeg"), args, { stdio: ["ignore", "pipe", "pipe"] });

    proc.stdout.on("data", (data) => console.log(`stdout: ${data}`));
    proc.stderr.on("data", (data) => console.error(`stderr: ${data}`));
    proc.on("error", (err) => reject(err));
    proc.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`ffmpeg exited with code ${code}`));
    });
  });
}

function getVideoDuration(videoId: string): Promise<number> {
  const input = path.join(UPLOADS_DIR, videoId);
  return new Promise((resolve, reject) => {
    const proc = spawn(
      resolveBinary("ffprobe"),
      [
        "-v",
        "error",
        "-show_entries",
        "format=duration",
        "-of",
        "csv=p=0",
        input,
      ],
      { stdio: ["ignore", "pipe", "pipe"] },
    );

    let stdout = "";
    proc.stdout.on("data", (data) => (stdout += data));
    proc.on("error", reject);
    proc.on("close", (code) => {
      if (code !== 0) return reject(new Error(`ffprobe exited with code ${code}`));
      const duration = parseFloat(stdout.trim());
      if (Number.isNaN(duration))
        return reject(new Error(`Could not parse duration: "${stdout.trim()}"`));
      resolve(duration);
    });
  });
}

queue.work("video", async (job) => {
  const videoId = job.data.id;
  if (!videoId) return;

  const outDir = path.join(UPLOADS_DIR, videoId + "_hls");
  mkdirSync(outDir, { recursive: true });

  await updateVideoStatus(videoId, "thumbnail-generating");

  try {
    const duration = await getVideoDuration(videoId);
    await runFfmpeg(getThumbnailArgs(videoId, duration));
    writeFileSync(path.join(outDir, "thumbnails.vtt"), generateThumbnailVtt(duration));
    console.log(`Thumbnails generated at ${outDir}/thumbnails.jpg`);
  } catch (err) {
    console.error(`Thumbnail generation failed: ${err}`);
    await updateVideoStatus(videoId, "error");
    return;
  }

  await updateVideoStatus(videoId, "transcoding");

  try {
    await runFfmpeg(getFfmpegArgs(videoId));
    writeFileSync(path.join(outDir, "master.m3u8"), getMasterPlaylist(videoId));
    console.log(`HLS output ready at ${outDir}/master.m3u8`);
  } catch (err) {
    console.error(`Transcoding failed: ${err}`);
    await updateVideoStatus(videoId, "error");
    return;
  }

  await updateVideoStatus(videoId, "processed");
});

console.log("Worker started");
