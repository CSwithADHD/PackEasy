import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { loadReplitFirebaseEnv } = require("./load-replit-env.cjs");

loadReplitFirebaseEnv();

const env = {
  ...process.env,
  EXPO_PACKAGER_PROXY_URL:
    process.env.EXPO_PACKAGER_PROXY_URL ||
    (process.env.REPLIT_EXPO_DEV_DOMAIN
      ? `https://${process.env.REPLIT_EXPO_DEV_DOMAIN}`
      : undefined),
  EXPO_PUBLIC_DOMAIN: process.env.EXPO_PUBLIC_DOMAIN || process.env.REPLIT_DEV_DOMAIN,
  EXPO_PUBLIC_API_BASE_URL:
    process.env.EXPO_PUBLIC_API_BASE_URL ||
    (process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}:8080` : undefined),
  EXPO_PUBLIC_REPL_ID: process.env.EXPO_PUBLIC_REPL_ID || process.env.REPL_ID,
  REACT_NATIVE_PACKAGER_HOSTNAME:
    process.env.REACT_NATIVE_PACKAGER_HOSTNAME || process.env.REPLIT_DEV_DOMAIN,
};

const args = ["exec", "expo", "start", "--localhost"];
if (process.env.PORT) {
  args.push("--port", process.env.PORT);
}

const result = spawnSync("pnpm", args, {
  stdio: "inherit",
  shell: true,
  env,
});

process.exit(result.status ?? 0);