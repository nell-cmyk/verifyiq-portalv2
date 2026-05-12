import assert from "node:assert/strict";
import { test } from "node:test";

import {
  ARTIFACT_PATHS,
  TRIAGE_FAILURE_WARNING,
  VALID_TARGETS,
  buildPlaywrightArgs,
  formatArtifactPathSummary,
  formatPlaywrightCommand,
  formatValidTargets,
  parsePortalArgs,
  resolveRunnerExitCode
} from "./run-portal-automation.mjs";

test("VALID_TARGETS contains the v1.1 allowlist", () => {
  assert.deepEqual(VALID_TARGETS, [
    "all",
    "public",
    "auth",
    "applications",
    "activity",
    "audit-logs",
    "users",
    "roles"
  ]);
});

test("ARTIFACT_PATHS lists triage and native Playwright outputs", () => {
  assert.ok(ARTIFACT_PATHS.includes("test-results/triage-summary.md"));
  assert.ok(ARTIFACT_PATHS.includes("playwright-report/"));
  assert.ok(ARTIFACT_PATHS.includes("test-results/results.json"));
  assert.ok(ARTIFACT_PATHS.includes("test-results/artifacts/"));
});

test("parsePortalArgs defaults to target all with no argv", () => {
  const result = parsePortalArgs([]);
  assert.equal(result.target, "all");
  assert.deepEqual(result.passthroughArgs, []);
});

test("parsePortalArgs accepts an explicit target", () => {
  const result = parsePortalArgs(["applications"]);
  assert.equal(result.target, "applications");
  assert.deepEqual(result.passthroughArgs, []);
});

test("parsePortalArgs collects passthrough args after the separator", () => {
  const result = parsePortalArgs(["applications", "--", "--headed"]);
  assert.equal(result.target, "applications");
  assert.deepEqual(result.passthroughArgs, ["--headed"]);
});

test("parsePortalArgs defaults target when only passthrough args are given", () => {
  const result = parsePortalArgs(["--", "--headed"]);
  assert.equal(result.target, "all");
  assert.deepEqual(result.passthroughArgs, ["--headed"]);
});

test("parsePortalArgs reports unknown targets without spawning", () => {
  const result = parsePortalArgs(["missing-target"]);
  assert.equal(result.valid, false);
  assert.equal(result.target, "missing-target");
  assert.deepEqual(result.validTargets, VALID_TARGETS);
});

test("parsePortalArgs treats debug-style flags before -- as unknown targets", () => {
  const result = parsePortalArgs(["--headed"]);
  assert.equal(result.valid, false);
  assert.equal(result.target, "--headed");
  assert.deepEqual(result.validTargets, VALID_TARGETS);
});

test("buildPlaywrightArgs maps public to the public-smoke project", () => {
  const args = buildPlaywrightArgs("public");
  assert.deepEqual(args, ["test", "--project=public-smoke"]);
});

test("buildPlaywrightArgs maps auth to the authenticated-chromium project", () => {
  const args = buildPlaywrightArgs("auth");
  assert.deepEqual(args, ["test", "--project=authenticated-chromium"]);
});

test("buildPlaywrightArgs targets the Add Application spec for applications", () => {
  const args = buildPlaywrightArgs("applications");
  assert.deepEqual(args, [
    "test",
    "--project=authenticated-chromium",
    "tests/authenticated/add-application.spec.ts"
  ]);
});

test("buildPlaywrightArgs appends passthrough flags after the target mapping", () => {
  const args = buildPlaywrightArgs("applications", ["--headed"]);
  assert.deepEqual(args, [
    "test",
    "--project=authenticated-chromium",
    "tests/authenticated/add-application.spec.ts",
    "--headed"
  ]);
});

test("buildPlaywrightArgs maps deep targets to authenticated coverage for now", () => {
  for (const target of ["activity", "audit-logs", "users", "roles"]) {
    const args = buildPlaywrightArgs(target);
    assert.deepEqual(args, ["test", "--project=authenticated-chromium"]);
  }
});

test("buildPlaywrightArgs maps all to a bare playwright test invocation", () => {
  const args = buildPlaywrightArgs("all");
  assert.deepEqual(args, ["test"]);
});

test("formatPlaywrightCommand joins the binary and args for printable output", () => {
  const command = formatPlaywrightCommand("node_modules/.bin/playwright", [
    "test",
    "--project=public-smoke"
  ]);
  assert.equal(
    command,
    "node_modules/.bin/playwright test --project=public-smoke"
  );
});

test("formatValidTargets lists every allowlisted target", () => {
  const formatted = formatValidTargets();
  for (const target of VALID_TARGETS) {
    assert.ok(formatted.includes(target));
  }
});

test("resolveRunnerExitCode returns Playwright failure code when triage succeeds", () => {
  assert.equal(resolveRunnerExitCode(1, 0), 1);
});

test("resolveRunnerExitCode preserves Playwright failure code when triage also fails", () => {
  assert.equal(resolveRunnerExitCode(2, 1), 2);
});

test("resolveRunnerExitCode preserves Playwright success when triage fails", () => {
  assert.equal(resolveRunnerExitCode(0, 1), 0);
});

test("resolveRunnerExitCode returns 0 when both Playwright and triage succeed", () => {
  assert.equal(resolveRunnerExitCode(0, 0), 0);
});

test("formatArtifactPathSummary heads the block with Artifacts:", () => {
  const summary = formatArtifactPathSummary();
  assert.ok(summary.startsWith("Artifacts:\n"));
});

test("formatArtifactPathSummary includes all four artifact paths", () => {
  const summary = formatArtifactPathSummary();
  for (const path of [
    "test-results/triage-summary.md",
    "playwright-report/",
    "test-results/results.json",
    "test-results/artifacts/"
  ]) {
    assert.ok(
      summary.includes(path),
      `Expected formatArtifactPathSummary to include ${path}`
    );
  }
});

test("TRIAGE_FAILURE_WARNING uses the exact preserve-Playwright wording", () => {
  assert.equal(
    TRIAGE_FAILURE_WARNING,
    "Warning: Playwright triage summary failed; preserving Playwright result."
  );
});

test("parsePortalArgs still rejects unknown targets after triage wiring", () => {
  const result = parsePortalArgs(["does-not-exist"]);
  assert.equal(result.valid, false);
  assert.equal(result.reason, "unknown_target");
  assert.equal(result.target, "does-not-exist");
});
