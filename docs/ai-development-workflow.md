# AI Development Workflow

This runbook is for future agents and maintainers working on VerifyIQ portal
automation. After reading it, they should be able to run phase work with Claude
Opus 4.7 as the implementer, Codex as the reviewer and test runner, and Codex as
the automatic fallback when Claude runs out of usable capacity.

## Roles

- Codex owns GSD planning, review, verification, and final reporting.
- Claude Opus 4.7 owns first-pass implementation for planned phase work.
- Playwright remains the executable source of truth for browser automation.
- GSD owns lifecycle state in `.planning/`.

Codex must not treat a Claude success message as proof. Codex verifies the
working tree, reviews the diff, and runs the required commands before marking
work complete.

## Before Execution

Claude Code must be installed and logged in locally:

```bash
claude --version
claude auth login --claudeai
printf 'Reply exactly: ok\n' | claude --model claude-opus-4-7 -p -
```

Codex must also be available:

```bash
codex --version
```

Local VerifyIQ credentials and Playwright auth state must stay ignored. Claude
Code is configured to deny reads of local environment files and Playwright auth
state. Do not pass secrets in prompts or command output.

## Phase Flow

1. Plan the phase in Codex/GSD.
2. Review and approve the plan before implementation.
3. Execute with GSD cross-AI delegation:

   ```bash
   $gsd-execute-phase <phase> --cross-ai
   ```

4. GSD sends the implementation prompt to the AI implementer wrapper. The GSD
   config uses npm's silent mode so captured summaries do not include npm's
   command banner.
5. The wrapper invokes Claude Opus 4.7 first unless `AI_IMPLEMENT_CLAUDE_MODEL`
   overrides it.
6. If Claude hits usage, quota, rate-limit, or overload errors, the wrapper
   gives Codex the same prompt plus the current working-tree context.
7. The wrapper emits a summary for GSD and records which runtime completed the
   implementation.
8. Codex reviews the result, runs verification, and updates GSD artifacts.

Missing Claude login is a setup failure, not a fallback condition. Fix login
before execution instead of silently switching to Codex.

## Verification

After implementation, Codex runs:

```bash
git status --short
git diff --check
npm run check
npm run test:e2e
```

When storage state is present, Codex also runs:

```bash
npm run test:e2e:auth
```

Before merge or milestone completion, run:

```bash
npm run test:e2e:all
```

If verification fails, Codex diagnoses the failure. Small fixes can be handled
directly by Codex. Larger implementation gaps should be sent back through the
same Claude-first wrapper unless Claude capacity is exhausted.

## Fallback Rules

Codex takeover is automatic only for Claude usage, quota, rate-limit, overload,
or temporary capacity failures. In takeover mode, Codex must preserve Claude's
partial edits and continue from the current diff.

Do not fallback for:

- Missing Claude login.
- Missing `claude` binary.
- Permission-denied failures caused by secret-protection rules.
- Prompts that require credentials or auth state in model context.

Those failures require setup or plan changes before execution continues.

## Standard Commands

- `npm run ai:implement` — implementation wrapper used by GSD cross-AI
  execution. Defaults to `claude-opus-4-7`.
- `$gsd-execute-phase <phase> --cross-ai` — standard execution entrypoint for
  Phase 2 onward.
- `npm run test:ai-workflow` — local unit tests for Claude success, Codex
  fallback, and auth-failure behavior.
