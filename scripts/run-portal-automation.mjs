import { spawn } from "node:child_process";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

export const VALID_TARGETS = [
  "all",
  "public",
  "auth",
  "applications",
  "activity",
  "audit-logs",
  "users",
  "roles"
];

export const ARTIFACT_PATHS = [
  "test-results/triage-summary.md",
  "playwright-report/",
  "test-results/results.json",
  "test-results/artifacts/"
];

const AUTHENTICATED_PROJECT = "--project=authenticated-chromium";
const PUBLIC_PROJECT = "--project=public-smoke";
const APPLICATIONS_SPEC = "tests/authenticated/add-application.spec.ts";

const TARGET_ARGS = {
  all: ["test"],
  public: ["test", PUBLIC_PROJECT],
  auth: ["test", AUTHENTICATED_PROJECT],
  applications: ["test", AUTHENTICATED_PROJECT, APPLICATIONS_SPEC],
  activity: ["test", AUTHENTICATED_PROJECT],
  "audit-logs": ["test", AUTHENTICATED_PROJECT],
  users: ["test", AUTHENTICATED_PROJECT],
  roles: ["test", AUTHENTICATED_PROJECT]
};

export function formatValidTargets() {
  return VALID_TARGETS.join(", ");
}

export function parsePortalArgs(argv) {
  const args = Array.isArray(argv) ? [...argv] : [];
  const separatorIndex = args.indexOf("--");

  let head;
  let passthroughArgs;
  if (separatorIndex === -1) {
    head = args;
    passthroughArgs = [];
  } else {
    head = args.slice(0, separatorIndex);
    passthroughArgs = args.slice(separatorIndex + 1);
  }

  if (head.length === 0) {
    return { target: "all", passthroughArgs };
  }

  if (head.length > 1) {
    return {
      valid: false,
      reason: "too_many_targets",
      target: head[0],
      extraTargets: head.slice(1),
      validTargets: VALID_TARGETS
    };
  }

  const target = head[0];
  if (!VALID_TARGETS.includes(target)) {
    return {
      valid: false,
      reason: "unknown_target",
      target,
      validTargets: VALID_TARGETS
    };
  }

  return { target, passthroughArgs };
}

export function buildPlaywrightArgs(target, passthroughArgs = []) {
  const baseArgs = TARGET_ARGS[target];
  if (!baseArgs) {
    throw new Error(`Unknown target: ${target}`);
  }
  const extras = Array.isArray(passthroughArgs) ? passthroughArgs : [];
  return [...baseArgs, ...extras];
}

export function formatPlaywrightCommand(playwrightBin, args) {
  return [playwrightBin, ...args].join(" ");
}

export function resolvePlaywrightBin(cwd = process.cwd()) {
  const binName =
    process.platform === "win32" ? "playwright.cmd" : "playwright";
  return resolve(cwd, "node_modules", ".bin", binName);
}

function isMainEntry() {
  if (!process.argv[1]) {
    return false;
  }
  const invokedHref = pathToFileURL(process.argv[1]).href;
  return import.meta.url === invokedHref;
}

async function runMain() {
  const parsed = parsePortalArgs(process.argv.slice(2));

  if (parsed.valid === false) {
    if (parsed.reason === "too_many_targets") {
      console.error(
        `Only one target may be supplied; received "${parsed.target}" and ${parsed.extraTargets
          .map((value) => `"${value}"`)
          .join(", ")}.`
      );
    } else {
      console.error(`Unknown portal target: "${parsed.target}".`);
    }
    console.error(`Valid targets: ${formatValidTargets()}.`);
    console.error(
      "Usage: npm run test:portal -- <target> [-- <playwright-flags>]"
    );
    process.exit(1);
  }

  const { target, passthroughArgs } = parsed;
  const playwrightBin = resolvePlaywrightBin();
  const playwrightArgs = buildPlaywrightArgs(target, passthroughArgs);

  console.log(`Portal target: ${target}`);
  console.log(
    `Playwright command: ${formatPlaywrightCommand(playwrightBin, playwrightArgs)}`
  );

  const child = spawn(playwrightBin, playwrightArgs, {
    cwd: process.cwd(),
    stdio: "inherit"
  });

  child.on("error", (error) => {
    console.error(`Failed to start Playwright: ${error.message}`);
    process.exit(1);
  });

  child.on("close", (code, signal) => {
    if (signal) {
      console.error(`Playwright terminated by signal ${signal}.`);
      process.exit(1);
    }
    process.exit(code ?? 1);
  });
}

if (isMainEntry()) {
  await runMain();
}
