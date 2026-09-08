import { config } from "dotenv";
import { Queue as BullMQQueue, Job, Worker } from "bullmq";
import IORedis from "ioredis";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Load the monorepo root .env (dotenv defaults to process.cwd(), which is
// whichever app is running — not the repo root)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.resolve(__dirname, "../../.env") });

// REDIS_URL uses rediss://, so ioredis enables TLS automatically
const connection = new IORedis.default(process.env.REDIS_URL!, {
  maxRetriesPerRequest: null,
});

class Queue {
  private name: string = "video-processing";
  private client: BullMQQueue;

  constructor() {
    this.client = new BullMQQueue(this.name, { connection });
  }

  async add(name: string, data: any) {
    await this.client.add(name, data);
  }

  async work(name: string, handler: (job: Job) => Promise<void>) {
    new Worker(this.name, handler, { connection: connection });
  }
}

const queue = new Queue();

export default queue;
