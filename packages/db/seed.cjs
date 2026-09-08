const { config } = require("dotenv");
const path = require("path");
config({ path: path.resolve(__dirname, "../../.env") });
const { Client } = require("pg");
(async () => {
  const c = new Client({ connectionString: process.env.DATABASE_URL });
  await c.connect();
  await c.query(
    "INSERT INTO videos (id, title, description, status) VALUES ($1,$2,$3,$4)",
    ["test-dummy-video", "Delete test dummy", "temporary row for testing", "processed"],
  );
  await c.end();
  console.log("dummy inserted");
})().catch((e) => { console.error(e.message); process.exit(1); });
