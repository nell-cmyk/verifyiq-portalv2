import { execFileSync, spawn } from "node:child_process";

const fallbackPatterns = [
  /usage limit/i,
  /rate limit/i,
  /overloaded/i,
  /capacity/i,
  /quota/i,
  /too many requests/i,
  /\b429\b/,
  /exceeded/i,
  /try again later/i,
  /limit.*reached/i,
  /message.*limit/i,
  /credit/i,
  /temporarily unavailable/i
];

const setupFailurePatterns = [
  /not logged in/i,
  /please run \/login/i,
  /authentication/i,
  /unauthenticated/i,
  /login required/i,
  /invalid api key/i,
  /permission denied/i,
  /spawn .* enoent/i,
  /command not found/i
];

function parseArgsOverride(value, fallback) {
  if (!value) {
    return fallback;
  }

  const parsed = JSON.parse(value);
  if (
    !Array.isArray(parsed) ||
    parsed.some((item) => typeof item !== "string")
  ) {
    throw new Error("Command argument override must be a JSON string array.");
  }
  return parsed;
}

function sanitizedEnv() {
  const env = { ...process.env };
  for (const key of Object.keys(env)) {
    if (
      key.startsWith("VERIFYIQ_") ||
      key === "PLAYWRIGHT_AUTH_STATE" ||
      key === "PLAYWRIGHT_STORAGE_STATE"
    ) {
      delete env[key];
    }
  }
  return env;
}

function redactSecrets(text) {
  let redacted = text;
  const secretValues = [
    process.env.VERIFYIQ_USERNAME,
    process.env.VERIFYIQ_PASSWORD,
    process.env.VERIFYIQ_STORAGE_STATE_JSON
  ].filter((value) => value && value.length >= 4);

  for (const value of secretValues) {
    redacted = redacted.split(value).join("[redacted]");
  }

  return redacted;
}

function runCommand(command, args, input) {
  return new Promise((resolve) => {
    const child = spawn(command, args, {
      cwd: process.cwd(),
      env: sanitizedEnv(),
      stdio: ["pipe", "pipe", "pipe"]
    });

    let stdout = "";
    let stderr = "";

    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.on("error", (error) => {
      stderr += error.message;
    });
    child.on("close", (code) => {
      resolve({
        code: code ?? 1,
        stdout: redactSecrets(stdout),
        stderr: redactSecrets(stderr)
      });
    });

    child.stdin.end(input);
  });
}

function hasPattern(patterns, text) {
  return patterns.some((pattern) => pattern.test(text));
}

function gitOutput(args) {
  try {
    return execFileSync("git", args, {
      cwd: process.cwd(),
      encoding: "utf8",
      maxBuffer: 1_000_000
    });
  } catch (error) {
    const output = error.stdout || error.stderr || error.message;
    return String(output);
  }
}

function currentWorktreeContext() {
  const status = gitOutput(["status", "--short"]);
  const stat = gitOutput(["diff", "--stat"]);
  const diff = gitOutput(["diff", "--", "."]);

  return [
    "## Current Working Tree Status",
    status.trim() || "(clean)",
    "",
    "## Current Diff Stat",
    stat.trim() || "(no diff stat)",
    "",
    "## Current Diff",
    diff.slice(0, 120_000) || "(no diff)"
  ].join("\n");
}

function codexTakeoverPrompt(originalPrompt, claudeFailure) {
  return [
    "You are Codex taking over implementation because Claude Opus hit a usage, rate-limit, quota, overload, or temporary-capacity failure.",
    "Continue from the current working tree. Preserve existing edits. Do not revert user or Claude changes unless the prompt explicitly requires it.",
    "Do not read or print secrets. Do not inspect .env or Playwright auth state. Keep final verification for the parent Codex session.",
    "",
    "## Original GSD Execution Prompt",
    originalPrompt,
    "",
    currentWorktreeContext(),
    "",
    "## Claude Failure Signal",
    claudeFailure.slice(0, 12_000),
    "",
    "When finished, summarize implemented changes and any verification you ran."
  ].join("\n");
}

function summary(executor, output) {
  const trimmed =
    output.trim() || "Implementation command completed without output.";
  return [
    "---",
    "status: implemented",
    `executor: ${executor}`,
    "---",
    "",
    "# Cross-AI Implementation Summary",
    "",
    `## Executor`,
    "",
    executor,
    "",
    "## Result",
    "",
    trimmed
  ].join("\n");
}

const input = await new Promise((resolve) => {
  let data = "";
  process.stdin.setEncoding("utf8");
  process.stdin.on("data", (chunk) => {
    data += chunk;
  });
  process.stdin.on("end", () => resolve(data));
});

if (!input.trim()) {
  console.error("AI implementation prompt was empty.");
  process.exit(1);
}

const claudeModel = process.env.AI_IMPLEMENT_CLAUDE_MODEL || "claude-opus-4-7";
const claudeCommand = process.env.AI_IMPLEMENT_CLAUDE_COMMAND || "claude";
const codexCommand = process.env.AI_IMPLEMENT_CODEX_COMMAND || "codex";
const claudeArgs = parseArgsOverride(
  process.env.AI_IMPLEMENT_CLAUDE_ARGS_JSON,
  ["--model", claudeModel, "--permission-mode", "acceptEdits", "-p", "-"]
);
const codexArgs = parseArgsOverride(process.env.AI_IMPLEMENT_CODEX_ARGS_JSON, [
  "exec",
  "--skip-git-repo-check",
  "-"
]);

console.error(`AI implementer: starting Claude (${claudeModel}).`);
const claude = await runCommand(claudeCommand, claudeArgs, input);
const claudeCombined = `${claude.stdout}\n${claude.stderr}`;

if (claude.code === 0) {
  console.error("AI implementer: Claude completed implementation.");
  console.log(summary("claude", claude.stdout));
  process.exit(0);
}

if (hasPattern(setupFailurePatterns, claudeCombined)) {
  console.error("AI implementer: Claude setup/auth/permission failure.");
  console.error(claudeCombined.trim());
  process.exit(1);
}

if (!hasPattern(fallbackPatterns, claudeCombined)) {
  console.error("AI implementer: Claude failed with a non-fallback error.");
  console.error(claudeCombined.trim());
  process.exit(1);
}

console.error(
  "AI implementer: Claude capacity limit detected; handing off to Codex."
);
const codexPrompt = codexTakeoverPrompt(input, claudeCombined);
const codex = await runCommand(codexCommand, codexArgs, codexPrompt);
const codexCombined = `${codex.stdout}\n${codex.stderr}`;

if (codex.code !== 0) {
  console.error("AI implementer: Codex fallback failed.");
  console.error(codexCombined.trim());
  process.exit(1);
}

console.error("AI implementer: Codex completed fallback implementation.");
console.log(summary("codex", codex.stdout));
