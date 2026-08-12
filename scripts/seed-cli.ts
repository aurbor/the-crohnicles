import { runSeed } from "../lib/db/seed";

runSeed().then(() => {
  console.log("Seed complete.");
  process.exit(0);
});
