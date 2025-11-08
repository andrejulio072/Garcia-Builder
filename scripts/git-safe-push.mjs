import { execSync } from "node:child_process";
import { chdir } from "node:process";

const project = process.env.PROJECT || "iron-brothers";
const path = project === "iron-brothers"
  ? "C:/dev/iron-brothers/starter-website"
  : "C:/dev/Garcia-Builder";

chdir(path);
const run = (cmd) => execSync(cmd, { stdio: "inherit" });

run("git add -A");
try { run('git commit -m "chore: autopush"'); } catch {}
run("git push");
