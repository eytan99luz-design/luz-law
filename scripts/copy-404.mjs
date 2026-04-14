import { copyFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const sourceFile = resolve("dist", "index.html");
const targetFile = resolve("dist", "404.html");

if (!existsSync(sourceFile)) {
  console.error("Missing dist/index.html");
  process.exit(1);
}

copyFileSync(sourceFile, targetFile);
console.log("Copied dist/index.html to dist/404.html");