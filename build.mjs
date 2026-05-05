import { existsSync } from "node:fs";
import { copyFile, mkdir, readdir, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const dist = join(root, "dist");

async function copyDirectory(source, destination) {
  await mkdir(destination, { recursive: true });
  const entries = await readdir(source, { withFileTypes: true });

  for (const entry of entries) {
    const sourcePath = join(source, entry.name);
    const destinationPath = join(destination, entry.name);

    if (entry.isDirectory()) {
      await copyDirectory(sourcePath, destinationPath);
    } else {
      await copyFile(sourcePath, destinationPath);
    }
  }
}

for (const requiredPath of ["index.html", "styles.css", "script.js"]) {
  if (!existsSync(join(root, requiredPath))) {
    throw new Error(`Missing required file or folder: ${requiredPath}`);
  }
}

const primaryAssets = join(root, "assets");
const publicAssets = join(root, "public", "assets");
const assetSource = existsSync(primaryAssets)
  ? primaryAssets
  : existsSync(publicAssets)
    ? publicAssets
    : null;

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });

await copyFile(join(root, "index.html"), join(dist, "index.html"));
await copyFile(join(root, "styles.css"), join(dist, "styles.css"));
await copyFile(join(root, "script.js"), join(dist, "script.js"));

if (assetSource) {
  await copyDirectory(assetSource, join(dist, "assets"));
} else {
  console.warn("No assets folder found. Deploying without image assets.");
}

console.log("Static resume built to dist/");
