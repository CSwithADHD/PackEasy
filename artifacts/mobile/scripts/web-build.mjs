import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const { loadReplitFirebaseEnv } = require("./load-replit-env.cjs");

loadReplitFirebaseEnv();

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distDir = path.join(projectRoot, "dist");

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

const result = spawnSync("pnpm", ["exec", "expo", "export", "--platform", "web"], {
  stdio: "inherit",
  shell: true,
  env: process.env,
});

if ((result.status ?? 0) === 0) {
  await prepareGitHubPagesOutput();
}

process.exit(result.status ?? 0);