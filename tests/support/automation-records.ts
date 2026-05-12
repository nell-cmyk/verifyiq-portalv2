import { randomBytes } from "node:crypto";

export type AutomationRecordArea =
  | "applications"
  | "activity"
  | "audit-logs"
  | "users"
  | "roles"
  | (string & {});

export type AutomationAction = "update" | "delete" | "cleanup";

export type AutomationCleanupStatus = "succeeded" | "failed" | "skipped";

export type AutomationCleanupReason =
  | "candidate_missing"
  | "control_missing"
  | "timeout"
  | "unknown";

export interface AutomationRecord {
  readonly label: string;
  readonly visibleName: string;
  readonly area: AutomationRecordArea;
  readonly runId: string;
  readonly routeOrSection?: string;
}

export interface AutomationCleanupNote {
  readonly visibleName: string;
  readonly action: AutomationAction;
  readonly status: AutomationCleanupStatus;
  readonly reason?: AutomationCleanupReason;
  readonly routeOrSection?: string;
}

export interface AutomationRunContext {
  readonly runId: string;
  readonly area: AutomationRecordArea;
  readonly records: AutomationRecord[];
  readonly cleanupNotes: AutomationCleanupNote[];
}

export interface AutomationRunContextOptions {
  readonly runId?: string;
}

export interface AutomationRecordInput {
  readonly label: string;
  readonly visibleName: string;
  readonly routeOrSection?: string;
}

export interface AutomationCleanupResult {
  readonly action: AutomationAction;
  readonly status: AutomationCleanupStatus;
  readonly reason?: AutomationCleanupReason;
  readonly routeOrSection?: string;
}

export interface AutomationDiagnosticsRecord {
  readonly label: string;
  readonly visibleName: string;
  readonly area: AutomationRecordArea;
  readonly runId: string;
  readonly routeOrSection?: string;
}

export interface AutomationRunDiagnostics {
  readonly runId: string;
  readonly area: AutomationRecordArea;
  readonly attemptedAction?: AutomationAction;
  readonly records: ReadonlyArray<AutomationDiagnosticsRecord>;
  readonly cleanupNotes: ReadonlyArray<AutomationCleanupNote>;
}

export type AutomationMutationAction = Exclude<AutomationAction, "cleanup">;

export type AutomationCandidate = string | { readonly visibleName: string };

const RUN_ID_PATTERN = /^\d{8}-\d{6}-[0-9a-f]{4}$/;
const HEX_SUFFIX_PATTERN = /^[0-9a-f]{4}$/;

function pad2(value: number): string {
  return value.toString().padStart(2, "0");
}

function formatUtcTimestamp(date: Date): string {
  const yyyy = date.getUTCFullYear().toString().padStart(4, "0");
  const mm = pad2(date.getUTCMonth() + 1);
  const dd = pad2(date.getUTCDate());
  const hh = pad2(date.getUTCHours());
  const mi = pad2(date.getUTCMinutes());
  const ss = pad2(date.getUTCSeconds());
  return `${yyyy}${mm}${dd}-${hh}${mi}${ss}`;
}

function defaultRandomSuffix(): string {
  return randomBytes(2).toString("hex");
}

export function createAutomationRunId(
  date: Date = new Date(),
  randomSuffix: string = defaultRandomSuffix()
): string {
  if (!HEX_SUFFIX_PATTERN.test(randomSuffix)) {
    throw new Error(
      "createAutomationRunId requires a 4-character lowercase hex suffix."
    );
  }
  return `${formatUtcTimestamp(date)}-${randomSuffix}`;
}

export function createAutomationRunContext(
  area: AutomationRecordArea,
  options: AutomationRunContextOptions = {}
): AutomationRunContext {
  const runId = options.runId ?? createAutomationRunId();
  if (!RUN_ID_PATTERN.test(runId)) {
    throw new Error(
      "createAutomationRunContext received a run id that does not match the YYYYMMDD-HHmmss-xxxx shape."
    );
  }
  return {
    runId,
    area,
    records: [],
    cleanupNotes: []
  };
}

function runPrefix(context: AutomationRunContext): string {
  return `AUTOMATION ${context.area} ${context.runId} `;
}

export function createAutomationRecordName(
  context: AutomationRunContext,
  recordLabel: string
): string {
  return `${runPrefix(context)}${recordLabel}`;
}

export function registerAutomationRecord(
  context: AutomationRunContext,
  input: AutomationRecordInput
): AutomationRecord {
  const expectedPrefix = runPrefix(context);
  if (!input.visibleName.startsWith(expectedPrefix)) {
    throw new Error(
      `registerAutomationRecord refused visible name "${input.visibleName}": visible_name_missing_run_prefix.`
    );
  }
  const record: AutomationRecord = {
    label: input.label,
    visibleName: input.visibleName,
    area: context.area,
    runId: context.runId,
    routeOrSection: input.routeOrSection
  };
  context.records.push(record);
  return record;
}

function candidateVisibleName(candidate: AutomationCandidate): string {
  return typeof candidate === "string" ? candidate : candidate.visibleName;
}

export function assertSameRunMutationTarget(
  context: AutomationRunContext,
  record: AutomationRecord,
  candidates: ReadonlyArray<AutomationCandidate>,
  action: AutomationMutationAction
): AutomationCandidate {
  if (record.area !== context.area || !context.records.includes(record)) {
    throw new Error(
      `assertSameRunMutationTarget refused "${record.visibleName}" for ${action}: record_not_registered.`
    );
  }

  if (record.runId !== context.runId) {
    throw new Error(
      `assertSameRunMutationTarget refused "${record.visibleName}" for ${action}: stale_run_id.`
    );
  }

  const expectedPrefix = runPrefix(context);
  if (!record.visibleName.startsWith(expectedPrefix)) {
    throw new Error(
      `assertSameRunMutationTarget refused "${record.visibleName}" for ${action}: visible_name_missing_run_prefix.`
    );
  }

  if (candidates.length === 0) {
    throw new Error(
      `assertSameRunMutationTarget refused "${record.visibleName}" for ${action}: zero_matches.`
    );
  }

  const exactMatches = candidates.filter(
    (candidate) => candidateVisibleName(candidate) === record.visibleName
  );

  if (exactMatches.length > 1) {
    throw new Error(
      `assertSameRunMutationTarget refused "${record.visibleName}" for ${action}: multiple_matches (${exactMatches.length}).`
    );
  }

  if (exactMatches.length === 0) {
    throw new Error(
      `assertSameRunMutationTarget refused "${record.visibleName}" for ${action}: candidate_name_mismatch.`
    );
  }

  return exactMatches[0]!;
}

export function recordAutomationCleanup(
  context: AutomationRunContext,
  record: AutomationRecord,
  result: AutomationCleanupResult
): AutomationCleanupNote {
  assertRegisteredSameRunRecord(context, record, result.action);

  const note: AutomationCleanupNote = {
    visibleName: record.visibleName,
    action: result.action,
    status: result.status,
    reason:
      result.status === "failed" ? (result.reason ?? "unknown") : undefined,
    routeOrSection: result.routeOrSection ?? record.routeOrSection
  };
  context.cleanupNotes.push(note);
  return note;
}

export function getAutomationCleanupFailures(
  context: AutomationRunContext
): AutomationCleanupNote[] {
  return context.cleanupNotes.filter((note) => note.status === "failed");
}

export function aggregateAutomationFailures(
  originalError: unknown,
  cleanupErrors: ReadonlyArray<unknown>,
  message: string
): unknown {
  const hasOriginal = originalError !== undefined;
  const cleanupCount = cleanupErrors.length;
  const diagnosticMessage = safeDiagnosticMessage(message);
  const cleanupResidueErrors = cleanupErrors.map(
    (_, index) =>
      new Error(`automation_cleanup_failed: cleanup_error_${index + 1}`)
  );

  if (!hasOriginal && cleanupCount === 0) {
    return undefined;
  }

  if (!hasOriginal && cleanupCount === 1) {
    return new Error(`automation_cleanup_failed: ${diagnosticMessage}`);
  }

  if (!hasOriginal && cleanupCount > 1) {
    return new AggregateError(
      cleanupResidueErrors,
      `automation_cleanup_failed: ${diagnosticMessage}`
    );
  }

  if (hasOriginal && cleanupCount === 0) {
    return originalError;
  }

  return new AggregateError(
    [originalError, ...cleanupResidueErrors],
    `automation_cleanup_failed: ${diagnosticMessage}`
  );
}

function assertRegisteredSameRunRecord(
  context: AutomationRunContext,
  record: AutomationRecord,
  action: AutomationAction
): void {
  if (record.area !== context.area || !context.records.includes(record)) {
    throw new Error(
      `recordAutomationCleanup refused "${record.visibleName}" for ${action}: record_not_registered.`
    );
  }

  if (record.runId !== context.runId) {
    throw new Error(
      `recordAutomationCleanup refused "${record.visibleName}" for ${action}: stale_run_id.`
    );
  }

  if (!record.visibleName.startsWith(runPrefix(context))) {
    throw new Error(
      `recordAutomationCleanup refused "${record.visibleName}" for ${action}: visible_name_missing_run_prefix.`
    );
  }
}

function safeDiagnosticMessage(message: string): string {
  return message
    .replace(
      /password|token|cookie|storageState|\.env|innerHTML|outerHTML|document\.body/gi,
      "[redacted]"
    )
    .slice(0, 160);
}

export function formatAutomationRunDiagnostics(
  context: AutomationRunContext,
  attemptedAction?: AutomationAction
): AutomationRunDiagnostics {
  return {
    runId: context.runId,
    area: context.area,
    attemptedAction,
    records: context.records.map((record) => ({
      label: record.label,
      visibleName: record.visibleName,
      area: record.area,
      runId: record.runId,
      routeOrSection: record.routeOrSection
    })),
    cleanupNotes: context.cleanupNotes.map((note) => ({
      visibleName: note.visibleName,
      action: note.action,
      status: note.status,
      reason: note.reason,
      routeOrSection: note.routeOrSection
    }))
  };
}
