#!/usr/bin/env node
/**
 * Capture README screenshots (public routes). Requires dev server:
 *   npm run dev
 *   node scripts/capture-readme-screenshots.mjs
 */
import { mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, "..", "docs", "screenshots");
const base = process.env.SCREENSHOT_BASE_URL ?? "http://localhost:3000";

const shots = [
  { file: "landing.png", path: "/", width: 1280 },
  { file: "client-home.png", path: "/login?demo=1", width: 1280 },
  { file: "booking-flow.png", path: "/coaches", width: 1280 },
  { file: "mobile.png", path: "/", width: 390, height: 844 },
];

async function main() {
  await mkdir(outDir, { recursive: true });
  const browser = await chromium.launch();
  const context = await browser.newContext({
    deviceScaleFactor: 2,
  });

  for (const { file, path, width, height = 720 } of shots) {
    const page = await context.newPage();
    await page.setViewportSize({ width, height });
    const url = `${base.replace(/\/$/, "")}${path}`;
    console.log(`→ ${url} → ${file}`);
    await page.goto(url, { waitUntil: "networkidle", timeout: 60_000 });
    await page.waitForTimeout(800);
    await page.screenshot({
      path: join(outDir, file),
      fullPage: height > 800,
    });
    await page.close();
  }

  await browser.close();
  console.log(`\nSaved to ${outDir}`);
  console.log("Tip: sign in as Marko, open /me and /coaches/<id>, re-run or capture manually for coach-dashboard.png");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
