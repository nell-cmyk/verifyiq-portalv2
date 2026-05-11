# Phase 3: Core VerifyIQ Workflow Coverage - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution
> agents. Decisions are captured in CONTEXT.md - this log preserves the
> alternatives considered.

**Date:** 2026-05-10T14:57:32Z **Phase:** 3-Core VerifyIQ Workflow Coverage
**Areas discussed:** Primary workflow path, Test data stance, Mutation boundary,
Coverage depth

---

## Primary Workflow Path

| Question                                                | Options Considered                                                   | User's Choice               |
| ------------------------------------------------------- | -------------------------------------------------------------------- | --------------------------- |
| Which workflow should planning prioritize first?        | Existing application; Add application; Activity path                 | Add application             |
| How far should the Add Application path go?             | Open form only; Fill required fields; Submit when safe               | Submit when safe            |
| What is safe enough before submit?                      | Env-gated submit; Sandbox always okay; Planner investigates          | Sandbox always okay         |
| After submission, what should the test assert?          | Created record visible; Success feedback only; Planner investigates  | Created record visible      |
| Should the path focus on a specific type?               | Default/first available; Bank statement path; Planner investigates   | Default/first available     |
| Should Phase 3 include cleanup?                         | Only if UI exposes it; Always cleanup; No cleanup                    | Only if UI exposes it       |
| What naming convention should generated data use?       | Timestamped automation name; Human-like sample name; Planner decides | Timestamped automation name |
| Is network/API inspection or setup allowed?             | Inspect only; Use API setup; No network inspection                   | Use API setup               |
| If upload is required, what file source should be used? | Use a committed fixture; Use generated fixture; Skip upload path     | Use a committed fixture     |
| What committed fixture is acceptable?                   | Synthetic PDF/image; Realistic redacted doc; Planner decides         | Synthetic PDF/image         |
| What should upload assert?                              | File accepted; Preview visible; Processing result                    | File accepted               |
| Should coverage run in default authenticated CI?        | Yes, default auth CI; Separate opt-in project; Local only first      | Yes, default auth CI        |
| Which browser scope?                                    | Desktop Chrome only; Add mobile coverage; Planner decides            | Desktop Chrome only         |
| How should unknown form shape fail?                     | Fail with field inventory; Fail normally; Skip if shape unknown      | Fail with field inventory   |
| Locator preference?                                     | Roles/labels first; Test ids preferred; Either is fine               | Roles/labels first          |
| Should there be a helper abstraction?                   | Small workflow helper; Inline test steps; Page object                | Small workflow helper       |

**Notes:** Phase 3 starts with Add Application, can submit in sandbox by
default, should prove the created record is visible, and may use a committed
synthetic fixture if upload is required.

---

## Test Data Stance

| Question                                     | Options Considered                                              | User's Choice      |
| -------------------------------------------- | --------------------------------------------------------------- | ------------------ |
| Where should required test values come from? | Generated defaults; Env-provided fixtures; Planner investigates | Generated defaults |
| Should optional fields be filled?            | Required fields only; Common optional fields; Planner decides   | Planner decides    |
| What uniqueness source should be used?       | Timestamp/run id; Random UUID; Short random suffix              | Timestamp/run id   |
| Should there be a reusable fixture builder?  | Small builder; Inline data; Planner decides                     | Planner decides    |

**Notes:** Generated defaults should be safe and traceable. Planning can choose
whether optional fields and fixture builders are warranted after inspecting the
live form.

---

## Mutation Boundary

| Question                                                          | Options Considered                                                   | User's Choice           |
| ----------------------------------------------------------------- | -------------------------------------------------------------------- | ----------------------- |
| Beyond creating the application, what mutations are allowed?      | Create only; Create + upload; Full workflow mutations                | Full workflow mutations |
| How should irreversible or externally visible actions be handled? | Avoid irreversible actions; Allow in sandbox; Planner investigates   | Allow in sandbox        |
| Should processing or verification results be checked?             | Only if fast/stable; Always wait for result; Submit and stop         | Only if fast/stable     |
| Should docs warn about test data accumulation?                    | Yes, document it; No, obvious for sandbox; Only if no cleanup exists | Yes, document it        |

**Notes:** Full workflow mutations are allowed when visible and stable.
Documentation should warn that durable sandbox records may be created and
cleanup is best-effort.

---

## Coverage Depth

| Question                                             | Options Considered                                                     | User's Choice                |
| ---------------------------------------------------- | ---------------------------------------------------------------------- | ---------------------------- |
| What is the minimum passing Phase 3 coverage?        | One complete happy path; Happy path + validation; Full workflow matrix | Full workflow matrix         |
| How should the matrix be bounded?                    | Stable visible variants only; All visible variants; Planner sets cap   | Stable visible variants only |
| Should Phase 3 include negative/validation coverage? | Yes, one stable validation; No, happy/matrix only; Planner decides     | Yes, one stable validation   |
| How should slow async states be handled?             | Bounded polling; Long timeout okay; Do not wait                        | Long timeout okay            |

**Notes:** Aim for a full stable visible matrix, include one deterministic
validation assertion, and allow longer workflow-specific timeout when async
processing is core to the value.

---

## the agent's Discretion

- Choose optional field coverage after inspecting the live Add Application form.
- Choose inline generated values or a small fixture builder based on form
  complexity.
- Choose exact helper names and organization while keeping helpers narrow.

## Deferred Ideas

None.
