import { config } from "dotenv";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { pgTable, text, varchar } from "drizzle-orm/pg-core";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Load the monorepo root .env (dotenv defaults to process.cwd(), which is
// whichever app is running — not the repo root)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.resolve(__dirname, "../../.env") });

export const db = drizzle(process.env.DATABASE_URL!);

export const videosTable = pgTable("videos", {
  id: text().primaryKey(),
  title: varchar({ length: 255 }).notNull(),
  description: varchar({ length: 255 }).notNull(),
  status: varchar({ length: 255 }).notNull(),
});

export type VideoStatus =
  | "uploaded"
  | "thumbnail-generating"
  | "transcoding"
  | "error"
  | "processed";

export async function updateVideoStatus(id: string, status: VideoStatus) {
  await db.update(videosTable).set({ status }).where(eq(videosTable.id, id));
}

export async function insertVideo(data: {
  id: string;
  title: string;
  description: string;
  status: VideoStatus;
}) {
  await db.insert(videosTable).values(data);
}

export async function getVideos() {
  return db.select().from(videosTable);
}

export async function getVideo(id: string) {
  return db.select().from(videosTable).where(eq(videosTable.id, id));
}

export async function deleteVideo(id: string) {
  await db.delete(videosTable).where(eq(videosTable.id, id));
}
