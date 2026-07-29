import { spawn } from "node:child_process";

const port = 4173;
const root = new URL("../dist/", import.meta.url);
const server = spawn(
  "python3",
  ["-u", "-m", "http.server", String(port), "--directory", root.pathname],
  { stdio: ["ignore", "pipe", "pipe"] },
);

const paths = [
  "/",
  "/en/",
  "/services/",
  "/services/cybersecurity/",
  "/services/ai-agents/",
  "/services/google-business-profile/",
  "/services/seo/",
  "/about/",
  "/work/",
  "/insights/",
  "/insights/ai-agent-business/",
  "/brand/",
  "/contact/",
  "/privacy/",
  "/terms/",
  "/sitemap.xml",
  "/robots.txt",
  "/llms.txt",
  "/manifest.webmanifest",
  "/assets/css/main.css",
  "/assets/js/main.js",
  "/assets/brand/bowdy-labs-mark.svg",
  "/assets/media/bowdy-intelligence.webp",
  "/assets/media/bowdy-intelligence-760.webp",
  "/assets/media/bowdy-intelligence-1200.webp",
  "/assets/og/bowdy-labs-og.png",
];

const waitForServer = async () => {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/`, { method: "HEAD" });
      if (response.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error("Local server did not start");
};

try {
  await waitForServer();
  const rows = await Promise.all(
    paths.map(async (path) => {
      const response = await fetch(`http://127.0.0.1:${port}${path}`);
      return {
        path,
        status: response.status,
        contentType: response.headers.get("content-type"),
      };
    }),
  );
  rows.forEach((row) => console.log(`${row.path} | ${row.status} | ${row.contentType}`));
  if (rows.some((row) => row.status !== 200)) process.exitCode = 1;
} finally {
  server.kill("SIGTERM");
}
