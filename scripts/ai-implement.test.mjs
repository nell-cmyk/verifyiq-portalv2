import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { test } from "node:test";
import { fileURLToPath, URL } from "node:url";

const script = fileURLToPath(new URL("./ai-implement.mjs", import.meta.url));

function runWrapper(env, input = "Implement the planned change.") {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [script], {
      env: {
        ...process.env,
        ...env,
        VERIFYIQ_USERNAME: "test-user@example.invalid",
        VERIFYIQ_PASSWORD: "redacted-test-value"
      },
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
    child.on("close", (code) => {
      resolve({ code, stdout, stderr });
    });
    child.stdin.end(input);
  });
}

test("uses Claude output when Claude succeeds", async () => {
  const result = await runWrapper({
    AI_IMPLEMENT_CLAUDE_COMMAND: process.execPath,
    AI_IMPLEMENT_CLAUDE_ARGS_JSON: JSON.stringify([
      "-e",
      "process.stdin.resume(); process.stdin.on('end', () => console.log('# Claude result\\nimplemented'));"
    ]),
    AI_IMPLEMENT_CODEX_COMMAND: process.execPath,
    AI_IMPLEMENT_CODEX_ARGS_JSON: JSON.stringify(["-e", "process.exit(99);"])
  });

  assert.equal(result.code, 0);
  assert.match(result.stdout, /executor: claude/);
  assert.match(result.stdout, /Claude result/);
  assert.doesNotMatch(result.stdout, /redacted-test-value/);
});

test("falls back to Codex on Claude usage limit", async () => {
  const result = await runWrapper({
    AI_IMPLEMENT_CLAUDE_COMMAND: process.execPath,
    AI_IMPLEMENT_CLAUDE_ARGS_JSON: JSON.stringify([
      "-e",
      "process.stderr.write('usage limit reached'); process.exit(1);"
    ]),
    AI_IMPLEMENT_CODEX_COMMAND: process.execPath,
    AI_IMPLEMENT_CODEX_ARGS_JSON: JSON.stringify([
      "-e",
      "let input=''; process.stdin.on('data', c => input += c); process.stdin.on('end', () => { if (!input.includes('Current Working Tree Status')) process.exit(2); console.log('# Codex result\\nimplemented'); });"
    ])
  });

  assert.equal(result.code, 0);
  assert.match(result.stdout, /executor: codex/);
  assert.match(result.stdout, /Codex result/);
  assert.match(result.stderr, /handing off to Codex/);
});

test("does not fallback when Claude is not logged in", async () => {
  const result = await runWrapper({
    AI_IMPLEMENT_CLAUDE_COMMAND: process.execPath,
    AI_IMPLEMENT_CLAUDE_ARGS_JSON: JSON.stringify([
      "-e",
      "process.stderr.write('Not logged in · Please run /login'); process.exit(1);"
    ]),
    AI_IMPLEMENT_CODEX_COMMAND: process.execPath,
    AI_IMPLEMENT_CODEX_ARGS_JSON: JSON.stringify(["-e", "process.exit(99);"])
  });

  assert.equal(result.code, 1);
  assert.match(result.stderr, /setup\/auth\/permission failure/);
  assert.doesNotMatch(result.stdout, /executor: codex/);
});

test("does not fallback when Claude binary is missing", async () => {
  const result = await runWrapper({
    AI_IMPLEMENT_CLAUDE_COMMAND: "definitely-missing-claude-command",
    AI_IMPLEMENT_CLAUDE_ARGS_JSON: JSON.stringify([]),
    AI_IMPLEMENT_CODEX_COMMAND: process.execPath,
    AI_IMPLEMENT_CODEX_ARGS_JSON: JSON.stringify(["-e", "process.exit(99);"])
  });

  assert.equal(result.code, 1);
  assert.match(result.stderr, /setup\/auth\/permission failure/);
  assert.doesNotMatch(result.stdout, /executor: codex/);
});
