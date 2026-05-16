import { spawnSync } from "node:child_process";

process.env.NODE_ENV = "development";

const buildResult = spawnSync("pnpm", ["run", "build"], {
  stdio: "inherit",
  shell: true,
  env: process.env,
});

if (buildResult.status !== 0) {
  process.exit(buildResult.status ?? 1);
}

const startResult = spawnSync("pnpm", ["run", "start"], {
  stdio: "inherit",
  shell: true,
  env: process.env,
});

process.exit(startResult.status ?? 0);