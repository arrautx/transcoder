import { deleteVideo, getVideo, getVideos, insertVideo } from "@repo/db";
import queue from "@repo/queue";
import { rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import cors from "cors";
import express from "express";
import multer from "multer";
import { z } from "zod";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOADS_DIR = path.resolve(__dirname, "../../../uploads");

const app = express();
app.use(express.json());
app.use(express.urlencoded());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use("/uploads", express.static("../../uploads/"));

app.get("/videos", async (__, res) => {
  const videos = await getVideos();

  res.json({
    videos,
  });
});

app.get("/videos/:id", async (req, res) => {
  const rows = await getVideo(req.params.id);
  const video = rows[0] ?? null;

  res.json({ video });
});

app.delete("/videos/:id", async (req, res) => {
  const id = req.params.id;
  const rows = await getVideo(id);
  if (!rows[0]) {
    return res.status(404).json({ error: "Video not found" });
  }

  await deleteVideo(id);

  // Remove the raw upload and the HLS output (ignore missing files)
  await Promise.allSettled([
    rm(path.join(UPLOADS_DIR, id), { force: true }),
    rm(path.join(UPLOADS_DIR, `${id}_hls`), { recursive: true, force: true }),
  ]);

  res.json({ ok: true });
});

const upload = multer({ dest: "../../uploads/" });

app.get("/", (req, res) => {
  res.send("Hello, world!");
});

const videoSchema = z.object({
  title: z.string().min(10),
  description: z.string().min(20),
});

app.post("/upload", upload.single("video"), async (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).send("No file uploaded");
  }

  const { data, error } = videoSchema.safeParse(req.body);

  if (error) {
    res.json({
      error: "Invalid Body",
    });
    return;
  }

  queue.add("video", {
    id: file.filename,
  });

  await insertVideo({
    id: file.filename,
    title: data.title,
    description: data.description,
    status: "uploaded",
  });

  res.json({
    id: file.filename,
  });
});

app.listen(4000, () => {
  console.log("Server is running on port 4000");
});
