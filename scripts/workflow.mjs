import { execSync } from "node:child_process";
import { env } from "node:process";

const map = {
  "iron-brothers": "C:/dev/iron-brothers/starter-website",
  "garcia-builder": "C:/dev/Garcia-Builder"
};
const project = env.PROJECT || "iron-brothers";
const cwd = map[project];
if (!cwd) throw new Error("Unknown PROJECT: " + project);

const run = (cmd) => execSync(cmd, { stdio: "inherit", cwd });

run("npm run ci:prep");
run("npm run ci:build");
