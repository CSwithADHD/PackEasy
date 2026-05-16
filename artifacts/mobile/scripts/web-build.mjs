import { cp, copyFile, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const { loadReplitFirebaseEnv } = require("./load-replit-env.cjs");

loadReplitFirebaseEnv();

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const workspaceRoot = path.resolve(projectRoot, "..", "..");
const distDir = path.join(projectRoot, "dist");

async function loadEnvFile(filePath) {
  try {
    const content = await readFile(filePath, "utf8");

    for (const rawLine of content.split(/\r?\n/)) {
      const line = rawLine.trim();

      if (!line || line.startsWith("#")) {
        continue;
      }

      const match = line.match(/^([A-Z0-9_]+)\s*=\s*(.*)$/);
      if (!match) {
        continue;
      }

      const key = match[1];
      let value = match[2].trim();

      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      if (process.env[key] == null) {
        process.env[key] = value;
      }
    }
  } catch {
    return;
  }
}

await loadEnvFile(path.join(workspaceRoot, ".env.production"));

function normalizeBasePath(value) {
  const trimmed = (value || "").trim();

  if (!trimmed || trimmed === "/") {
    return "";
  }

  return `/${trimmed.replace(/^\/+/, "").replace(/\/+$/, "")}`;
}

function joinBasePath(basePath, assetPath) {
  if (!basePath) {
    return `/${assetPath.replace(/^\/+/, "")}`;
  }

  return `${basePath}/${assetPath.replace(/^\/+/, "")}`;
}

async function prepareGitHubPagesOutput() {
  const basePath = normalizeBasePath(process.env.BASE_PATH);

  if (!basePath) {
    return;
  }

  const indexPath = path.join(distDir, "index.html");
  const indexHtml = await readFile(indexPath, "utf8");
  const rewrittenHtml = indexHtml.replace(/(href|src)="\/(?!\/)([^"]+)"/g, (_match, attribute, assetPath) => {
    return `${attribute}="${joinBasePath(basePath, assetPath)}"`;
  });

  await writeFile(indexPath, rewrittenHtml);
  await copyFile(indexPath, path.join(distDir, "404.html"));
  await writeFile(path.join(distDir, ".nojekyll"), "");
  console.log(`Prepared GitHub Pages output for base path ${basePath}`);
}

async function syncRootDist() {
  const rootDistDir = path.join(workspaceRoot, "dist");

  await rm(rootDistDir, { recursive: true, force: true });
  await cp(distDir, rootDistDir, { recursive: true });
  console.log("Synced root dist for Vercel");
}

const result = spawnSync("pnpm", ["exec", "expo", "export", "--platform", "web"], {
  stdio: "inherit",
  shell: true,
  env: process.env,
});

if ((result.status ?? 0) === 0) {
  await prepareGitHubPagesOutput();
  await syncRootDist();
}

process.exit(result.status ?? 0);