// Nightly: respect holders, wavewarz, render. Each source runs on its own so one failing
// does not stop the others; the exit code says if any failed.
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
let failed = 0;
for (const step of ["respect.mjs", "wavewarz.mjs"]) {
  const r = spawnSync(process.execPath, [path.join(here, step)], { stdio: "inherit" });
  if (r.status !== 0) { failed++; console.error(`${step} failed (${r.status})`); }
}
const r = spawnSync(process.execPath, [path.join(here, "render.mjs")], { stdio: "inherit" });
if (r.status !== 0) failed++;
process.exit(failed ? 1 : 0);
