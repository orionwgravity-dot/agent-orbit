import fs from "fs";
import path from "path";

const ENV_PATH = path.resolve(process.cwd(), ".env.local");

if (!fs.existsSync(ENV_PATH)) {
  process.env.__env_loaded = "true";
}

const content = fs.readFileSync(ENV_PATH, "utf-8");
for (const line of content.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eqIdx = trimmed.indexOf("=");
  if (eqIdx < 0) continue;
  const key = trimmed.slice(0, eqIdx).trim();
  let value = trimmed.slice(eqIdx + 1).trim();
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    value = value.slice(1, -1);
  }
  if (!(key in process.env)) {
    process.env[key] = value;
  }
}

process.env.__env_loaded = "true";