import { spawnSync } from "node:child_process";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

const testFiles = [
  "src/constants/canvasDefaults.test.ts",
  "src/utils/borderUnion.test.ts",
  "src/utils/deleteEntity.test.ts",
  "src/utils/createProject.test.ts",
];

console.log("Running Takegumi Unit Tests...");

const child = spawnSync(
  "npx",
  ["tsx", "--test", ...testFiles],
  {
    cwd: ROOT,
    stdio: "inherit",
    shell: true,
  }
);

process.exit(child.status ?? 0);
