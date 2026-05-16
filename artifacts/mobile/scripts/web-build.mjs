import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { loadReplitFirebaseEnv } = require("./load-replit-env.cjs");

loadReplitFirebaseEnv();

const result = spawnSync("pnpm", ["exec", "expo", "export", "--platform", "web"], {
  stdio: "inherit",
  shell: true,
  env: process.env,
});

process.exit(result.status ?? 0);