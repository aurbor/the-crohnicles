import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import * as schema from "./schema";

const DATABASE_PATH = process.env.DATABASE_PATH ?? "./data/crohnicles.db";

type DrizzleDb = ReturnType<typeof drizzle<typeof schema>>;

let instance: DrizzleDb | undefined;

// Opening the database is deferred until first actual use rather than done
// at module load. Next.js's build-time "Collecting page data" step imports
// every route module (often via several parallel workers) purely to inspect
// its exports — it never calls into the code — so a connection opened eagerly
// at module scope gets raced by those workers and better-sqlite3 throws
// SQLITE_BUSY ("database is locked").
function getDb(): DrizzleDb {
  if (!instance) {
    fs.mkdirSync(path.dirname(DATABASE_PATH), { recursive: true });
    const sqlite = new Database(DATABASE_PATH);
    sqlite.pragma("journal_mode = WAL");
    sqlite.pragma("foreign_keys = ON");
    instance = drizzle(sqlite, { schema });
  }
  return instance;
}

export const db: DrizzleDb = new Proxy({} as DrizzleDb, {
  get(_target, prop, _receiver) {
    const real = getDb();
    const value = Reflect.get(real as object, prop, real);
    return typeof value === "function" ? value.bind(real) : value;
  },
});
