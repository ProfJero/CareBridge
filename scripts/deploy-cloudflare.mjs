#!/usr/bin/env node
/**
 * Build and deploy to Cloudflare Pages (project "sambea-sd" → https://sambea-sd.pages.dev).
 *
 *   CLOUDFLARE_API_TOKEN=… CLOUDFLARE_ACCOUNT_ID=… node scripts/deploy-cloudflare.mjs [--branch main]
 *
 * Static files are bundled into the server worker (Nitro `serveStatic: "inline"`), and the
 * worker is bundled into one `_worker.js` and sent straight to the Pages deployments API,
 * so the deploy needs only a "Cloudflare Pages: Edit" API token — no asset-upload step.
 * If you connect the Pages project to GitHub instead, the normal `npm run build` with
 * output directory `dist` works too.
 */
import { execFileSync } from "node:child_process";
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const project = process.env.CF_PAGES_PROJECT ?? "sambea-sd";
const branchArg = process.argv.indexOf("--branch");
const branch = branchArg > -1 ? process.argv[branchArg + 1] : "main";
const root = process.cwd();
const out = join(root, ".cf-deploy");

const run = (cmd, args, env = {}) =>
  execFileSync(cmd, args, { stdio: "inherit", env: { ...process.env, ...env } });

run("npm", ["run", "build"], { CF_INLINE_ASSETS: "1" });

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
cpSync(join(root, "dist", "_worker.js"), join(out, "_worker.js"), { recursive: true });
writeFileSync(join(out, "_routes.json"), JSON.stringify({ version: 1, include: ["/*"], exclude: [] }));

// Serve the inlined static files from the worker rather than the (empty) Pages asset store.
const entry = join(out, "_worker.js", "index.js");
const source = readFileSync(entry, "utf8");
const patched = source.replace(/if \(env\.ASSETS && isPublicAssetURL\(url\.pathname\)\) return env\.ASSETS\.fetch\(cfReq\);/, "");
if (patched === source) throw new Error("Could not find the ASSETS passthrough in the worker entry; Nitro output changed.");
writeFileSync(entry, patched);

// One self-contained module for the deployments API.
const single = join(out, "single");
mkdirSync(single, { recursive: true });
run("npx", [
  "-y",
  "esbuild@0.25.10",
  entry,
  "--bundle",
  "--format=esm",
  "--platform=neutral",
  "--target=es2022",
  "--main-fields=module,main",
  "--conditions=workerd,worker,browser",
  "--external:node:*",
  "--external:cloudflare:*",
  `--outfile=${join(single, "_worker.js")}`,
  "--log-level=warning",
]);

let commit = "";
try {
  commit = execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim();
} catch {
  commit = "";
}

const account = process.env.CLOUDFLARE_ACCOUNT_ID;
if (!account) throw new Error("Set CLOUDFLARE_ACCOUNT_ID.");
const form = new FormData();
form.append("manifest", "{}");
form.append("branch", branch);
if (commit) form.append("commit_hash", commit);
form.append("commit_dirty", "true");
form.append("_worker.js", new Blob([readFileSync(join(single, "_worker.js"))], { type: "application/javascript+module" }), "_worker.js");
form.append("_routes.json", new Blob([readFileSync(join(out, "_routes.json"))], { type: "application/json" }), "_routes.json");
const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${account}/pages/projects/${project}/deployments`, {
  method: "POST",
  headers: { Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN ?? ""}` },
  body: form,
});
const body = await response.json();
if (!body.success) throw new Error(`Deploy failed: ${JSON.stringify(body.errors)}`);
console.log(`Deployed ${body.result.url} (${body.result.environment}) → https://${project}.pages.dev`);
