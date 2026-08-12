export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { runMigrations } = await import("@/lib/db/migrate");
    const { runSeed } = await import("@/lib/db/seed");
    runMigrations();
    await runSeed();
  }
}
