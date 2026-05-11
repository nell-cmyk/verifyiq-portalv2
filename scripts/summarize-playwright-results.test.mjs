import assert from "node:assert/strict";
import { test } from "node:test";
import {
  classifyTest,
  collectTests,
  formatSummary,
  sanitizeText
} from "./summarize-playwright-results.mjs";

function makeResult(overrides = {}) {
  return {
    status: "passed",
    duration: 100,
    retry: 0,
    error: undefined,
    errors: [],
    stdout: [],
    stderr: [],
    attachments: [],
    workerIndex: 0,
    parallelIndex: 0,
    startTime: "2026-05-11T00:00:00.000Z",
    annotations: [],
    ...overrides
  };
}

function makeTest({
  projectName = "public-smoke",
  status = "expected",
  results = [makeResult()]
} = {}) {
  return {
    projectName,
    projectId: projectName,
    timeout: 30_000,
    annotations: [],
    expectedStatus: "passed",
    status,
    results
  };
}

function makeSpec({
  title = "demo test",
  file = "tests/public/demo.spec.ts",
  tests
} = {}) {
  return {
    tags: [],
    title,
    ok: true,
    id: `${file}::${title}`,
    file,
    line: 1,
    column: 1,
    tests: tests ?? [makeTest()]
  };
}

function makeReport(specs) {
  return {
    config: { projects: [] },
    suites: [
      {
        title: "root",
        file: "",
        column: 0,
        line: 0,
        specs,
        suites: []
      }
    ],
    errors: [],
    stats: {
      startTime: "2026-05-11T00:00:00.000Z",
      duration: 1234,
      expected: 1,
      unexpected: 0,
      flaky: 0,
      skipped: 0
    }
  };
}

test("collectTests walks nested suites and specs", () => {
  const innerSpec = makeSpec({ title: "nested" });
  const report = {
    suites: [
      {
        title: "outer",
        specs: [],
        suites: [
          {
            title: "inner",
            specs: [innerSpec],
            suites: []
          }
        ]
      }
    ]
  };
  const tests = collectTests(report.suites);
  assert.equal(tests.length, 1);
  assert.equal(tests[0].spec.title, "nested");
});

test("classifyTest returns auth_setup for setup project tests", () => {
  const spec = makeSpec({ file: "tests/auth.setup.ts" });
  const setupTest = makeTest({ projectName: "setup", status: "unexpected" });
  assert.equal(classifyTest(setupTest, spec), "auth_setup");
});

test("classifyTest returns auth_setup when auth recovery message present", () => {
  const spec = makeSpec({ file: "tests/public/demo.spec.ts" });
  const failingTest = makeTest({
    projectName: "public-smoke",
    status: "unexpected",
    results: [
      makeResult({
        status: "failed",
        error: {
          message:
            "Stored VerifyIQ auth state from VERIFYIQ_STORAGE_STATE_JSON did not reach the authenticated app."
        }
      })
    ]
  });
  assert.equal(classifyTest(failingTest, spec), "auth_setup");
});

test("classifyTest returns retry_flaky for flaky tests", () => {
  const spec = makeSpec();
  const flakyTest = makeTest({
    status: "flaky",
    results: [
      makeResult({ status: "failed", retry: 0 }),
      makeResult({ status: "passed", retry: 1 })
    ]
  });
  assert.equal(classifyTest(flakyTest, spec), "retry_flaky");
});

test("formatSummary writes all required headings", () => {
  const summary = formatSummary(makeReport([makeSpec()]));
  for (const heading of [
    "# Playwright Triage Summary",
    "## Run Stats",
    "## Auth/Setup State",
    "## Failed Application Tests",
    "## Retry/Flaky Tests",
    "## Skipped Tests",
    "## Native Artifacts"
  ]) {
    assert.match(summary, new RegExp(heading.replace(/[/]/g, "\\$&")));
  }
});

test("formatSummary surfaces auth/setup section with recovery guidance for setup failure", () => {
  const setupSpec = makeSpec({
    file: "tests/auth.setup.ts",
    title: "authenticate",
    tests: [
      makeTest({
        projectName: "setup",
        status: "unexpected",
        results: [
          makeResult({
            status: "failed",
            error: {
              message:
                "Stored VerifyIQ auth state from VERIFYIQ_STORAGE_STATE_JSON did not reach the authenticated app. It may be expired."
            }
          })
        ]
      })
    ]
  });
  const summary = formatSummary(makeReport([setupSpec]));
  assert.match(summary, /## Auth\/Setup State/);
  assert.match(summary, /npm run auth:record/);
  assert.match(summary, /authenticate/);
});

test("formatSummary lists failed application tests separately from auth", () => {
  const appSpec = makeSpec({
    file: "tests/public/demo.spec.ts",
    title: "application regression",
    tests: [
      makeTest({
        projectName: "public-smoke",
        status: "unexpected",
        results: [
          makeResult({
            status: "failed",
            error: { message: "expect(received).toBe(expected) failed" }
          })
        ]
      })
    ]
  });
  const summary = formatSummary(makeReport([appSpec]));
  assert.match(summary, /## Failed Application Tests/);
  assert.match(summary, /application regression/);
  assert.match(summary, /public-smoke/);
});

test("formatSummary shows retry/flaky entry when a test retries", () => {
  const flakySpec = makeSpec({
    file: "tests/public/flaky.spec.ts",
    title: "flaky scenario",
    tests: [
      makeTest({
        projectName: "public-smoke",
        status: "flaky",
        results: [
          makeResult({ status: "failed", retry: 0 }),
          makeResult({ status: "passed", retry: 1 })
        ]
      })
    ]
  });
  const summary = formatSummary(makeReport([flakySpec]));
  assert.match(summary, /## Retry\/Flaky Tests/);
  assert.match(summary, /flaky scenario/);
});

test("formatSummary redacts secret-like fixture values from errors and notes", () => {
  const leakySpec = makeSpec({
    file: "tests/public/secrets.spec.ts",
    title: "secret-leak test",
    tests: [
      makeTest({
        projectName: "public-smoke",
        status: "unexpected",
        results: [
          makeResult({
            status: "failed",
            error: {
              message:
                'boom redacted-test-value VERIFYIQ_PASSWORD=secret cookie: abc token: abc storageState: {"cookies":[]}'
            },
            stdout: [{ text: "redacted-test-value should never appear" }],
            stderr: [{ text: "cookie: abc; token: abc" }]
          })
        ]
      })
    ]
  });
  const summary = formatSummary(makeReport([leakySpec]), {
    skipNote:
      "Skipped because VERIFYIQ_STORAGE_STATE_JSON=plaintext-secret with redacted-test-value embedded."
  });
  assert.doesNotMatch(summary, /redacted-test-value/);
  assert.doesNotMatch(summary, /VERIFYIQ_PASSWORD=secret/);
  assert.doesNotMatch(summary, /cookie: abc/);
  assert.doesNotMatch(summary, /token: abc/);
  assert.doesNotMatch(summary, /storageState/);
});

test("formatSummary handles missing report with explicit message", () => {
  const summary = formatSummary(null);
  assert.match(summary, /## Run Stats/);
  assert.match(
    summary,
    /No Playwright JSON report found at test-results\/results\.json\./
  );
});

test("sanitizeText redacts canonical secret patterns", () => {
  const cases = [
    "VERIFYIQ_USERNAME=user@example.com",
    "VERIFYIQ_PASSWORD=hunter2",
    'VERIFYIQ_STORAGE_STATE_JSON={"cookies":[]}',
    "VERIFYIQ_STORAGE_STATE_PATH=/tmp/state.json",
    "Authorization: Bearer abc",
    "Cookie: session=xyz",
    "token: tok_abc",
    "storageState: serialized-data",
    "redacted-test-value"
  ];
  for (const raw of cases) {
    const sanitized = sanitizeText(raw);
    assert.notEqual(sanitized, raw, `sanitizeText should redact: ${raw}`);
    assert.match(sanitized, /\[redacted\]/);
  }
});
