import { expect, test } from "@playwright/test";
import {
  aggregateAutomationFailures,
  assertSameRunMutationTarget,
  createAutomationRecordName,
  createAutomationRunContext,
  createAutomationRunId,
  formatAutomationRunDiagnostics,
  getAutomationCleanupFailures,
  recordAutomationCleanup,
  registerAutomationRecord,
  type AutomationRunContext
} from "../support/automation-records.js";

const fixedRunId = "20260512-124455-a7f3";
const fixedDate = new Date("2026-05-12T12:44:55Z");

function makeUsersContext(): AutomationRunContext {
  return createAutomationRunContext("users", { runId: fixedRunId });
}

test("createAutomationRunId formats a sortable YYYYMMDD-HHmmss-xxxx run id", () => {
  expect(createAutomationRunId(fixedDate, "a7f3")).toBe("20260512-124455-a7f3");
});

test("createAutomationRunId rejects a non-hex suffix", () => {
  expect(() => createAutomationRunId(fixedDate, "zzzz")).toThrow(
    /4-character lowercase hex/
  );
});

test("createAutomationRecordName builds the locked AUTOMATION visible name shape", () => {
  const context = makeUsersContext();
  expect(createAutomationRecordName(context, "reviewer")).toBe(
    "AUTOMATION users 20260512-124455-a7f3 reviewer"
  );
});

test("registerAutomationRecord stores the record in context.records", () => {
  const context = makeUsersContext();
  const visibleName = createAutomationRecordName(context, "reviewer");

  const record = registerAutomationRecord(context, {
    label: "reviewer",
    visibleName,
    routeOrSection: "/users"
  });

  expect(context.records).toHaveLength(1);
  expect(context.records[0]).toBe(record);
  expect(record.visibleName).toBe(
    "AUTOMATION users 20260512-124455-a7f3 reviewer"
  );
  expect(record.area).toBe("users");
  expect(record.runId).toBe(fixedRunId);
});

test("registerAutomationRecord rejects a malformed visible name with visible_name_missing_run_prefix", () => {
  const context = makeUsersContext();

  expect(() =>
    registerAutomationRecord(context, {
      label: "reviewer",
      visibleName: "AUTOMATION users wrong-run-id reviewer"
    })
  ).toThrow(/visible_name_missing_run_prefix/);
});

test("assertSameRunMutationTarget returns the single exact same-run candidate", () => {
  const context = makeUsersContext();
  const visibleName = createAutomationRecordName(context, "reviewer");
  const record = registerAutomationRecord(context, {
    label: "reviewer",
    visibleName,
    routeOrSection: "/users"
  });

  const candidates = [
    "Some Other User",
    visibleName,
    "AUTOMATION users 20260101-010101-0000 stale"
  ];

  const matched = assertSameRunMutationTarget(
    context,
    record,
    candidates,
    "update"
  );

  expect(matched).toBe(visibleName);
});

test("assertSameRunMutationTarget rejects an unregistered record with record_not_registered", () => {
  const context = makeUsersContext();
  const visibleName = createAutomationRecordName(context, "reviewer");
  const unregisteredRecord = {
    label: "reviewer",
    visibleName,
    area: "users",
    runId: fixedRunId
  } as const;

  expect(() =>
    assertSameRunMutationTarget(
      context,
      unregisteredRecord,
      [visibleName],
      "delete"
    )
  ).toThrow(/record_not_registered/);
});

test("assertSameRunMutationTarget rejects a record carrying a stale_run_id from a previous run", () => {
  const context = makeUsersContext();
  const visibleName = createAutomationRecordName(context, "reviewer");
  const record = registerAutomationRecord(context, {
    label: "reviewer",
    visibleName
  });

  const driftedRecord = { ...record, runId: "20260101-010101-0000" };
  context.records[0] = driftedRecord;

  expect(() =>
    assertSameRunMutationTarget(context, driftedRecord, [visibleName], "update")
  ).toThrow(/stale_run_id/);
});

test("assertSameRunMutationTarget rejects zero candidates with zero_matches", () => {
  const context = makeUsersContext();
  const visibleName = createAutomationRecordName(context, "reviewer");
  const record = registerAutomationRecord(context, {
    label: "reviewer",
    visibleName
  });

  expect(() =>
    assertSameRunMutationTarget(context, record, [], "update")
  ).toThrow(/zero_matches/);
});

test("assertSameRunMutationTarget rejects duplicate candidates with multiple_matches", () => {
  const context = makeUsersContext();
  const visibleName = createAutomationRecordName(context, "reviewer");
  const record = registerAutomationRecord(context, {
    label: "reviewer",
    visibleName
  });

  expect(() =>
    assertSameRunMutationTarget(
      context,
      record,
      [visibleName, visibleName],
      "delete"
    )
  ).toThrow(/multiple_matches/);
});

test("assertSameRunMutationTarget rejects a candidate visible-name mismatch with candidate_name_mismatch", () => {
  const context = makeUsersContext();
  const visibleName = createAutomationRecordName(context, "reviewer");
  const record = registerAutomationRecord(context, {
    label: "reviewer",
    visibleName
  });

  expect(() =>
    assertSameRunMutationTarget(
      context,
      record,
      ["AUTOMATION users 20260512-124455-a7f3 different-label"],
      "update"
    )
  ).toThrow(/candidate_name_mismatch/);
});

test("recordAutomationCleanup and getAutomationCleanupFailures preserve a failed cleanup note", () => {
  const context = makeUsersContext();
  const visibleName = createAutomationRecordName(context, "reviewer");
  const record = registerAutomationRecord(context, {
    label: "reviewer",
    visibleName,
    routeOrSection: "/users"
  });

  recordAutomationCleanup(context, record, {
    action: "delete",
    status: "succeeded",
    routeOrSection: "/users"
  });

  recordAutomationCleanup(context, record, {
    action: "cleanup",
    status: "failed",
    reason: "control_missing",
    routeOrSection: "/users"
  });

  const failures = getAutomationCleanupFailures(context);
  expect(failures).toHaveLength(1);
  expect(failures[0]?.visibleName).toBe(visibleName);
  expect(failures[0]?.action).toBe("cleanup");
  expect(failures[0]?.routeOrSection).toBe("/users");
  expect(failures[0]?.reason).toBe("control_missing");
});

test("recordAutomationCleanup rejects unregistered records before appending notes", () => {
  const context = makeUsersContext();
  const visibleName = createAutomationRecordName(context, "reviewer");
  const unregisteredRecord = {
    label: "reviewer",
    visibleName,
    area: "users",
    runId: fixedRunId
  } as const;

  expect(() =>
    recordAutomationCleanup(context, unregisteredRecord, {
      action: "cleanup",
      status: "failed",
      reason: "unknown"
    })
  ).toThrow(/record_not_registered/);
  expect(context.cleanupNotes).toHaveLength(0);
});

test("recordAutomationCleanup rejects stale records before appending notes", () => {
  const context = makeUsersContext();
  const visibleName = createAutomationRecordName(context, "reviewer");
  const record = registerAutomationRecord(context, {
    label: "reviewer",
    visibleName
  });
  const driftedRecord = { ...record, runId: "20260101-010101-0000" };
  context.records[0] = driftedRecord;

  expect(() =>
    recordAutomationCleanup(context, driftedRecord, {
      action: "cleanup",
      status: "failed",
      reason: "unknown"
    })
  ).toThrow(/stale_run_id/);
  expect(context.cleanupNotes).toHaveLength(0);
});

test("formatAutomationRunDiagnostics keeps visible identifiers only and omits secret-bearing keys", () => {
  const context = makeUsersContext();
  const visibleName = createAutomationRecordName(context, "reviewer");
  const record = registerAutomationRecord(context, {
    label: "reviewer",
    visibleName,
    routeOrSection: "/users"
  });

  recordAutomationCleanup(context, record, {
    action: "cleanup",
    status: "failed",
    reason: "timeout",
    routeOrSection: "/users"
  });

  const diagnostics = formatAutomationRunDiagnostics(context, "update");

  expect(diagnostics.runId).toBe(fixedRunId);
  expect(diagnostics.area).toBe("users");
  expect(diagnostics.attemptedAction).toBe("update");
  expect(diagnostics.records).toHaveLength(1);
  expect(diagnostics.records[0]?.visibleName).toBe(visibleName);
  expect(diagnostics.cleanupNotes).toHaveLength(1);
  expect(diagnostics.cleanupNotes[0]?.visibleName).toBe(visibleName);

  const json = JSON.stringify(diagnostics);
  expect(json).not.toMatch(/password/i);
  expect(json).not.toMatch(/token/i);
  expect(json).not.toMatch(/cookie/i);
  expect(json).not.toMatch(/storageState/i);
  expect(json).not.toMatch(/\.env/);
});

test("aggregateAutomationFailures returns an AggregateError when an original failure and cleanup failure both exist", () => {
  const original = new Error("Original navigation assertion failed.");
  const cleanup = new Error("Cleanup delete failed for visible record.");

  const aggregated = aggregateAutomationFailures(
    original,
    [cleanup],
    "users mutation"
  );

  expect(aggregated).toBeInstanceOf(AggregateError);
  const aggregateError = aggregated as AggregateError;
  expect(aggregateError.message).toMatch(/automation_cleanup_failed/);
  expect(aggregateError.errors).toContain(original);
  expect(aggregateError.errors).not.toContain(cleanup);
  expect(aggregateError.errors[1]?.message).toBe(
    "automation_cleanup_failed: cleanup_error_1"
  );
});

test("aggregateAutomationFailures keeps cleanup error details out of top-level messages", () => {
  const aggregated = aggregateAutomationFailures(
    undefined,
    [
      new Error(
        "raw cleanup password token cookie storageState .env innerHTML outerHTML document.body"
      )
    ],
    "users password token cookie storageState .env innerHTML outerHTML document.body mutation"
  );

  expect(aggregated).toBeInstanceOf(Error);
  const message = (aggregated as Error).message;
  expect(message).toMatch(/automation_cleanup_failed/);
  expect(message).not.toMatch(/password/i);
  expect(message).not.toMatch(/token/i);
  expect(message).not.toMatch(/cookie/i);
  expect(message).not.toMatch(/storageState/i);
  expect(message).not.toMatch(/\.env/);
  expect(message).not.toMatch(/innerHTML/i);
  expect(message).not.toMatch(/outerHTML/i);
  expect(message).not.toMatch(/document\.body/i);
});

test("aggregateAutomationFailures preserves the original error alone when no cleanup failures exist", () => {
  const original = new Error("Original failure only.");
  expect(aggregateAutomationFailures(original, [], "context")).toBe(original);
});

test("aggregateAutomationFailures returns undefined when no failures exist", () => {
  expect(aggregateAutomationFailures(undefined, [], "context")).toBeUndefined();
});

test("documents same-run update/delete usage without live portal mutation", () => {
  const context = createAutomationRunContext("users", { runId: fixedRunId });

  const reviewerVisibleName = createAutomationRecordName(context, "reviewer");
  const auditorVisibleName = createAutomationRecordName(context, "auditor");

  const reviewer = registerAutomationRecord(context, {
    label: "reviewer",
    visibleName: reviewerVisibleName,
    routeOrSection: "/users"
  });
  const auditor = registerAutomationRecord(context, {
    label: "auditor",
    visibleName: auditorVisibleName,
    routeOrSection: "/users"
  });

  const visibleCandidatesAfterCreate = [
    "Existing operator (not automation)",
    reviewerVisibleName,
    auditorVisibleName
  ];

  const updateTarget = assertSameRunMutationTarget(
    context,
    reviewer,
    visibleCandidatesAfterCreate,
    "update"
  );
  expect(updateTarget).toBe(reviewerVisibleName);

  recordAutomationCleanup(context, reviewer, {
    action: "update",
    status: "succeeded",
    routeOrSection: "/users"
  });

  const deleteTarget = assertSameRunMutationTarget(
    context,
    auditor,
    visibleCandidatesAfterCreate,
    "delete"
  );
  expect(deleteTarget).toBe(auditorVisibleName);

  recordAutomationCleanup(context, auditor, {
    action: "delete",
    status: "succeeded",
    routeOrSection: "/users"
  });

  expect(getAutomationCleanupFailures(context)).toHaveLength(0);

  const diagnostics = formatAutomationRunDiagnostics(context, "delete");
  expect(diagnostics.records.map((r) => r.visibleName)).toEqual([
    reviewerVisibleName,
    auditorVisibleName
  ]);
  expect(diagnostics.cleanupNotes).toHaveLength(2);
});
