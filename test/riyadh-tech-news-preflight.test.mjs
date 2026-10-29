import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, copyFileSync, writeFileSync, readFileSync, existsSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = fileURLToPath(new URL("../", import.meta.url));
const archive = JSON.parse(readFileSync(join(root, "src/data/riyadh-tech-news.json"), "utf8"));
const packageJson = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));

function sandbox(t, data = archive) {
  const dir = mkdtempSync(join(tmpdir(), "bowdy-news-preflight-"));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  mkdirSync(join(dir, "src/data"), { recursive: true });
  mkdirSync(join(dir, "scripts"));
  for (const path of ["scripts/validate-news.mjs", "src/riyadh-tech-news-validation.mjs", "src/data/riyadh-tech-sources.json"]) copyFileSync(join(root, path), join(dir, path));
  writeFileSync(join(dir, "src/data/riyadh-tech-news.json"), JSON.stringify(data));
  return dir;
}

test("preflight validates the real archive without dependencies, dist, or file changes", t => {
  const dir = sandbox(t);
  const path = join(dir, "src/data/riyadh-tech-news.json");
  const before = readFileSync(path, "utf8");
  const result = spawnSync(process.execPath, ["scripts/validate-news.mjs"], { cwd: dir, encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
  assert.ok(result.stdout.includes(`${archive.articles.length} articles`));
  assert.equal(readFileSync(path, "utf8"), before);
  assert.equal(existsSync(join(dir, "dist")), false);
  assert.equal(existsSync(join(dir, "node_modules")), false);
});

test("candidate file errors exit nonzero and never modify the published archive", t => {
  const dir = sandbox(t);
  const archivePath = join(dir, "src/data/riyadh-tech-news.json");
  const before = readFileSync(archivePath, "utf8");
  const candidate = structuredClone(archive);
  candidate.articles[0].sourceId = "google";
  writeFileSync(join(dir, "candidate.json"), JSON.stringify(candidate));
  let result = spawnSync(process.execPath, ["scripts/validate-news.mjs", "--file", "candidate.json"], { cwd: dir, encoding: "utf8" });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /News data validation failed: articles\[0\].*"google"/);
  assert.match(result.stderr, /google-ai/);
  writeFileSync(join(dir, "candidate.json"), "{broken JSON");
  result = spawnSync(process.execPath, ["scripts/validate-news.mjs", "--file", "candidate.json"], { cwd: dir, encoding: "utf8" });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /News data validation failed:/);
  assert.equal(readFileSync(archivePath, "utf8"), before);
});

test("npm build lifecycle blocks bad news before generating any production output", t => {
  const data = structuredClone(archive);
  data.articles[0].sourceId = "google";
  const dir = sandbox(t, data);
  // Use the actual lifecycle and preflight scripts, with a harmless renderer
  // marker so the test needs neither Sharp nor a complete website checkout.
  writeFileSync(join(dir, "package.json"), JSON.stringify({ type: "module", scripts: {
    prebuild: packageJson.scripts.prebuild,
    "check:news": packageJson.scripts["check:news"],
    build: "node render.mjs",
  } }));
  writeFileSync(join(dir, "render.mjs"), 'import { writeFileSync } from "node:fs"; writeFileSync("render-started", "yes");');
  const run = () => spawnSync("npm", ["run", "build"], { cwd: dir, encoding: "utf8" });
  const blocked = run();
  assert.equal(blocked.status, 1, blocked.stdout + blocked.stderr);
  assert.match(blocked.stderr, /Unknown automatic-news sourceId "google"/);
  assert.equal(existsSync(join(dir, "render-started")), false);
  writeFileSync(join(dir, "src/data/riyadh-tech-news.json"), JSON.stringify(archive));
  const accepted = run();
  assert.equal(accepted.status, 0, accepted.stdout + accepted.stderr);
  assert.equal(existsSync(join(dir, "render-started")), true);
});
