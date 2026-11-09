import { spawn } from "node:child_process";

const ROOT = new URL("..", import.meta.url).pathname;
const children = [];

const killGroup = (child) => {
  if (!child?.pid) return;
  try {
    process.kill(-child.pid, "SIGKILL");
  } catch {
    // Already exited.
  }
};

const startLongRunning = (command, args) => {
  const child = spawn(command, args, {
    cwd: ROOT,
    detached: true,
    stdio: "inherit",
  });
  children.push(child);
  child.on("error", (error) => {
    console.error(error);
    for (const other of children) if (other !== child) killGroup(other);
    process.exitCode = 1;
  });
  child.on("exit", (code) => {
    for (const other of children) if (other !== child) killGroup(other);
    process.exitCode = code ?? 1;
  });
  return child;
};

const killChildren = () => {
  for (const child of children) killGroup(child);
};

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    killChildren();
    process.exitCode = signal === "SIGINT" ? 130 : 143;
  });
}
process.on("exit", killChildren);

const build = spawn("npm", ["run", "phrase-analysis:build"], {
  cwd: ROOT,
  stdio: "inherit",
});
build.on("error", (error) => {
  console.error(error);
  process.exitCode = 1;
});
build.on("exit", (code) => {
  if (code !== 0) {
    process.exitCode = code ?? 1;
    return;
  }
  startLongRunning("node_modules/.bin/tsx", [
    "watch",
    "netlify/functions/studio-assistant/dev-server.ts",
  ]);
  startLongRunning("npm", ["run", "start:compiler"]);
});
