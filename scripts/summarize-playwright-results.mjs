import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

const DEFAULT_RESULTS_PATH = "test-results/results.json";
const DEFAULT_OUTPUT_PATH = "test-results/triage-summary.md";
const DEFAULT_SKIP_NOTE_PATH = "test-results/auth-regression-skip.md";
const MISSING_REPORT_MESSAGE =
  "No Playwright JSON report found at test-results/results.json.";
const ERROR_MESSAGE_LIMIT = 300;

const STORAGE_STATE_RECOVERY =
  "Storage-state-first recovery: run `npm run auth:record` locally or refresh `VERIFYIQ_STORAGE_STATE_JSON` / `VERIFYIQ_STORAGE_STATE_PATH`. Validate auth state in a fresh browser context before treating the failure as a VerifyIQ app regression.";

const SECRET_PATTERNS = [
  {
    re: /VERIFYIQ_USERNAME\s*=\s*\S+/gi,
    replacement: "VERIFYIQ_USERNAME=[redacted]"
  },
  {
    re: /VERIFYIQ_PASSWORD\s*=\s*\S+/gi,
    replacement: "VERIFYIQ_PASSWORD=[redacted]"
  },
  {
    re: /VERIFYIQ_STORAGE_STATE_JSON\s*=\s*[^\n]+/gi,
    replacement: "VERIFYIQ_STORAGE_STATE_JSON=[redacted]"
  },
  {
    re: /VERIFYIQ_STORAGE_STATE_PATH\s*=\s*\S+/gi,
    replacement: "VERIFYIQ_STORAGE_STATE_PATH=[redacted]"
  },
  { re: /storageState[^\n]*/gi, replacement: "[redacted]" },
  { re: /set-cookie:[^\n]*/gi, replacement: "set-cookie: [redacted]" },
  { re: /cookie:[^\n]*/gi, replacement: "cookie: [redacted]" },
  { re: /authorization:[^\n]*/gi, replacement: "authorization: [redacted]" },
  { re: /token:[^\n]*/gi, replacement: "token: [redacted]" },
  { re: /redacted-test-value/gi, replacement: "[redacted]" }
];

export function sanitizeText(value) {
  if (value === null || value === undefined) {
    return "";
  }
  const source = typeof value === "string" ? value : String(value);
  let result = source;
  for (const { re, replacement } of SECRET_PATTERNS) {
    result = result.replace(re, replacement);
  }
  return result;
}

function truncate(value, limit = ERROR_MESSAGE_LIMIT) {
  if (value.length <= limit) {
    return value;
  }
  return `${value.slice(0, limit)}...`;
}

export function collectTests(suites) {
  const out = [];
  const walk = (suiteList) => {
    if (!Array.isArray(suiteList)) {
      return;
    }
    for (const suite of suiteList) {
      if (!suite || typeof suite !== "object") {
        continue;
      }
      if (Array.isArray(suite.specs)) {
        for (const spec of suite.specs) {
          if (!spec || typeof spec !== "object") {
            continue;
          }
          if (Array.isArray(spec.tests)) {
            for (const test of spec.tests) {
              if (!test || typeof test !== "object") {
                continue;
              }
              const results = Array.isArray(test.results) ? test.results : [];
              out.push({ test, spec, results });
            }
          }
        }
      }
      if (Array.isArray(suite.suites)) {
        walk(suite.suites);
      }
    }
  };
  walk(suites);
  return out;
}

function collectErrorMessages(test) {
  const messages = [];
  if (!test || !Array.isArray(test.results)) {
    return messages;
  }
  for (const result of test.results) {
    if (result?.error?.message) {
      messages.push(result.error.message);
    }
    if (Array.isArray(result?.errors)) {
      for (const error of result.errors) {
        if (error?.message) {
          messages.push(error.message);
        }
      }
    }
  }
  return messages;
}

function maxRetry(test) {
  if (!test || !Array.isArray(test.results)) {
    return 0;
  }
  let max = 0;
  for (const result of test.results) {
    if (typeof result?.retry === "number" && result.retry > max) {
      max = result.retry;
    }
  }
  return max;
}

function totalDurationMs(test) {
  if (!test || !Array.isArray(test.results)) {
    return 0;
  }
  let total = 0;
  for (const result of test.results) {
    if (typeof result?.duration === "number") {
      total += result.duration;
    }
  }
  return total;
}

function attachmentNames(test) {
  const names = new Set();
  if (!test || !Array.isArray(test.results)) {
    return [];
  }
  for (const result of test.results) {
    if (Array.isArray(result?.attachments)) {
      for (const attachment of result.attachments) {
        if (attachment?.name) {
          names.add(attachment.name);
        }
      }
    }
  }
  return [...names];
}

function looksLikeAuthSetup(test, spec) {
  if (test?.projectName === "setup") {
    return true;
  }
  const file = typeof spec?.file === "string" ? spec.file : "";
  if (file.includes("auth.setup.ts")) {
    return true;
  }
  const messages = collectErrorMessages(test);
  return messages.some(
    (message) =>
      message.includes("Stored VerifyIQ auth state from") ||
      message.includes("Invalid VERIFYIQ_STORAGE_STATE_JSON")
  );
}

export function classifyTest(test, spec) {
  if (looksLikeAuthSetup(test, spec)) {
    return "auth_setup";
  }
  if (test?.status === "flaky" || maxRetry(test) > 0) {
    return "retry_flaky";
  }
  if (test?.status === "unexpected") {
    return "application_failure";
  }
  if (test?.status === "skipped") {
    return "skipped";
  }
  return "expected";
}

function firstErrorMessage(test) {
  const messages = collectErrorMessages(test);
  if (messages.length === 0) {
    return "";
  }
  return truncate(sanitizeText(messages[0]));
}

function formatTestEntry({ test, spec }) {
  const project = test.projectName ?? "(unknown project)";
  const file = spec.file ?? "(unknown file)";
  const title = sanitizeText(spec.title ?? "(untitled)");
  const status = test.status ?? "(unknown)";
  const retries = maxRetry(test);
  const duration = totalDurationMs(test);
  const attachments = attachmentNames(test);
  const error = firstErrorMessage(test);

  const lines = [
    `- **${project}** - \`${file}\` - ${title}`,
    `  - Status: ${status}`,
    `  - Retries: ${retries}`,
    `  - Duration: ${duration}ms`
  ];
  if (attachments.length > 0) {
    lines.push(`  - Attachments: ${attachments.join(", ")}`);
  }
  if (error) {
    lines.push(`  - Error: ${error}`);
  }
  return lines.join("\n");
}

function formatSection(heading, entries, fallback) {
  const lines = [heading, ""];
  if (entries.length === 0) {
    lines.push(fallback);
  } else {
    lines.push(entries.map(formatTestEntry).join("\n"));
  }
  lines.push("");
  return lines.join("\n");
}

function formatRunStats(report) {
  const stats = report?.stats ?? {};
  const expected = stats.expected ?? 0;
  const unexpected = stats.unexpected ?? 0;
  const flaky = stats.flaky ?? 0;
  const skipped = stats.skipped ?? 0;
  const duration = typeof stats.duration === "number" ? stats.duration : 0;
  const startTime =
    typeof stats.startTime === "string" ? stats.startTime : "(unknown)";
  return [
    "## Run Stats",
    "",
    `- Expected: ${expected}`,
    `- Unexpected: ${unexpected}`,
    `- Flaky: ${flaky}`,
    `- Skipped: ${skipped}`,
    `- Duration: ${duration}ms`,
    `- Start time: ${startTime}`,
    ""
  ].join("\n");
}

function formatNativeArtifacts() {
  return [
    "## Native Artifacts",
    "",
    "Native Playwright outputs remain the source of truth for debugging.",
    "",
    "- HTML report: `playwright-report/`",
    "- JSON results: `test-results/results.json`",
    "- Screenshots, traces, videos: `test-results/artifacts/`",
    ""
  ].join("\n");
}

export function formatSummary(report, options = {}) {
  const skipNote =
    typeof options.skipNote === "string" ? options.skipNote.trim() : "";

  if (!report || typeof report !== "object") {
    return [
      "# Playwright Triage Summary",
      "",
      "## Run Stats",
      "",
      MISSING_REPORT_MESSAGE,
      "",
      "## Auth/Setup State",
      "",
      skipNote ? sanitizeText(skipNote) : "No auth/setup state recorded.",
      "",
      "## Failed Application Tests",
      "",
      "No application failures recorded.",
      "",
      "## Retry/Flaky Tests",
      "",
      "No retry-pass or flaky tests recorded.",
      "",
      "## Skipped Tests",
      "",
      "No skipped tests recorded.",
      "",
      formatNativeArtifacts()
    ].join("\n");
  }

  const tests = collectTests(report.suites);
  const buckets = {
    auth_setup: [],
    application_failure: [],
    retry_flaky: [],
    skipped: [],
    expected: []
  };
  for (const entry of tests) {
    const category = classifyTest(entry.test, entry.spec);
    buckets[category].push(entry);
  }

  const authFailures = buckets.auth_setup.filter(
    ({ test }) => test.status === "unexpected" || test.status === "flaky"
  );

  const authLines = ["## Auth/Setup State", ""];
  if (skipNote) {
    authLines.push(sanitizeText(skipNote));
    authLines.push("");
  }
  if (authFailures.length > 0) {
    authLines.push(authFailures.map(formatTestEntry).join("\n"));
    authLines.push("");
    authLines.push(STORAGE_STATE_RECOVERY);
  } else if (!skipNote) {
    authLines.push("No auth/setup failures detected.");
  }
  authLines.push("");

  return [
    "# Playwright Triage Summary",
    "",
    formatRunStats(report),
    authLines.join("\n"),
    formatSection(
      "## Failed Application Tests",
      buckets.application_failure,
      "No application failures detected."
    ),
    formatSection(
      "## Retry/Flaky Tests",
      buckets.retry_flaky,
      "No retry-pass or flaky tests detected."
    ),
    formatSection(
      "## Skipped Tests",
      buckets.skipped,
      "No skipped tests recorded."
    ),
    formatNativeArtifacts()
  ].join("\n");
}

async function readOptional(path) {
  try {
    return await readFile(path, "utf8");
  } catch {
    return null;
  }
}

export async function writeSummary({
  resultsPath = DEFAULT_RESULTS_PATH,
  outputPath = DEFAULT_OUTPUT_PATH,
  skipNotePath = DEFAULT_SKIP_NOTE_PATH
} = {}) {
  await mkdir(dirname(outputPath), { recursive: true });

  const skipNoteRaw = await readOptional(skipNotePath);
  const skipNote = skipNoteRaw ? sanitizeText(skipNoteRaw) : "";

  const raw = await readOptional(resultsPath);
  let report = null;
  if (raw) {
    try {
      report = JSON.parse(raw);
    } catch {
      report = null;
    }
  }

  const summary = formatSummary(report, { skipNote });
  await writeFile(outputPath, summary);
  return { outputPath, hasReport: Boolean(report) };
}

if (process.argv[1] && import.meta.url === `file://${process.argv[1]}`) {
  writeSummary().then(
    ({ outputPath, hasReport }) => {
      if (!hasReport) {
        console.log(
          `${MISSING_REPORT_MESSAGE} Wrote placeholder to ${outputPath}.`
        );
      } else {
        console.log(`Wrote triage summary to ${outputPath}.`);
      }
    },
    (error) => {
      console.error("Failed to write triage summary:", error?.message ?? error);
      process.exit(1);
    }
  );
}
