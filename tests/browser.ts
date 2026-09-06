import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { brotliDecompressSync } from "node:zlib";
import { execFileSync } from "node:child_process";
import { chromium, type LaunchOptions } from "@playwright/test";

/** Use the normal Playwright browser when present. The npm-bundled fallback
 * makes Linux sandbox tests reproducible when the browser CDN is unavailable.
 * All extracted binaries and shared libraries stay outside the source tree.
 */
export async function browserOptions(): Promise<LaunchOptions> {
  if (existsSync(chromium.executablePath())) return { headless: true };
  if (process.platform !== "linux")
    throw new Error(
      "Install the browser first: npx playwright install chromium",
    );
  const { default: packaged } = await import("@sparticuz/chromium");
  const cache = path.resolve(".cache/browser-libs");
  const lib = path.join(cache, "lib");
  if (!existsSync(path.join(lib, "libnss3.so"))) {
    mkdirSync(cache, { recursive: true });
    const archive = path.join(cache, "al2023.tar");
    const compressed = path.resolve(
      "node_modules/@sparticuz/chromium/bin/al2023.tar.br",
    );
    writeFileSync(archive, brotliDecompressSync(readFileSync(compressed)));
    execFileSync("tar", ["-xf", archive, "-C", cache]);
  }
  const env: Record<string, string> = Object.fromEntries(
    Object.entries(process.env).flatMap(([key, value]) =>
      value === undefined ? [] : [[key, value]],
    ),
  );
  env.LD_LIBRARY_PATH = [lib, env.LD_LIBRARY_PATH].filter(Boolean).join(":");
  return {
    executablePath: await packaged.executablePath(),
    // Use Playwright's normal browser defaults. Lambda's single-process and
    // in-process-GPU flags are not needed in this Linux sandbox.
    args: [
      "--no-sandbox",
      "--disable-dev-shm-usage",
      "--use-gl=angle",
      "--use-angle=swiftshader",
      "--enable-unsafe-swiftshader",
    ],
    env,
    headless: true,
  };
}
