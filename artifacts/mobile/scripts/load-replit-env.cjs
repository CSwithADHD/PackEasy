const fs = require("fs");
const path = require("path");

function parseSharedEnv(replitPath) {
  const content = fs.readFileSync(replitPath, "utf-8");
  const sharedSection = content.split("[userenv.shared]")[1];
  if (!sharedSection) return {};

  const result = {};
  for (const line of sharedSection.split(/\r?\n/)) {
    const match = line.match(/^([A-Z0-9_]+)\s*=\s*"([^"]*)"\s*$/);
    if (!match) continue;
    result[match[1]] = match[2];
  }
  return result;
}

function loadReplitFirebaseEnv() {
  const replitPath = path.resolve(__dirname, "..", "..", "..", ".replit");
  if (!fs.existsSync(replitPath)) {
    return;
  }

  const sharedEnv = parseSharedEnv(replitPath);
  for (const [key, value] of Object.entries(sharedEnv)) {
    if (process.env[key] == null && key.startsWith("EXPO_PUBLIC_FIREBASE_")) {
      process.env[key] = value;
    }
  }
}

module.exports = { loadReplitFirebaseEnv };