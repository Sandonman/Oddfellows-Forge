# Engineering Delivery SOP (Client Projects)

## Purpose

Define a repeatable delivery process for client work with clear scope control, predictable cadence, and measurable quality gates.

## Delivery Lifecycle

1. Intake and scope lock.
2. Estimation and commitment.
3. Build execution with weekly demos.
4. QA and release readiness verification.
5. Production release and handoff.
6. Stabilization and retrospective.

## 1) Estimation Standards

### Estimation framework

- Estimate by deliverable slices, not technical layers.
- Use three-point sizing for each slice: optimistic, likely, pessimistic.
- Convert each slice to a committed estimate using `likely + risk buffer`.
- Apply a project-level contingency of 15% for unknowns.

### Required estimation outputs

- Scope table with `in-scope`, `out-of-scope`, and `phase-2 backlog`.
- Assumptions list with explicit client dependencies.
- Milestone plan with target dates and owner per milestone.
- Risk register with mitigation and trigger conditions.

### Commitment rules

- No implementation begins before written scope lock.
- Any change request after scope lock is tagged as `change-request` and re-estimated.
- Delivery date commitments are based on current approved scope only.

## 2) QA Standards

### Definition of Done (feature level)

- Acceptance criteria mapped to test cases and marked pass.
- Unit/integration tests added for new logic paths.
- Core user journey validated on desktop and mobile.
- Error handling and empty-state behavior verified.
- Documentation updated for operational/admin usage where applicable.

### QA checklist (release candidate)

- Functional checks pass against acceptance criteria.
- Regression smoke suite passes for all MVP-critical flows.
- Basic performance check on key pages/endpoints.
- Security sanity checks completed:
  - auth and authorization
  - input validation
  - secrets/config handling
- Analytics/events validated for agreed business actions.

### Defect policy

- `critical/high` defects block release.
- `medium/low` defects require triage note and target fix date.
- Every defect includes reproducible steps, severity, and owner.

## 3) Release Readiness Standards

A release is ready only if all gates below are satisfied:

- Scope gate: all committed in-scope acceptance criteria completed.
- Quality gate: QA checklist complete with no open `critical/high` defects.
- Operations gate:
  - deployment procedure documented
  - rollback path tested or explicitly documented
  - monitoring/alerts active for critical workflows
- Handover gate:
  - client admin guide prepared
  - credentials/access handoff completed
  - support window and escalation contacts confirmed

## 4) Delivery Cadence Standards

### Internal cadence

- Daily async engineering update (yesterday/today/blockers).
- Twice-weekly internal risk review on scope, schedule, and defects.
- Weekly release readiness checkpoint once build enters QA.

### Client cadence

- Weekly live demo with progress against acceptance criteria.
- Weekly written status summary:
  - completed this week
  - planned next week
  - risks/decisions needed
  - scope change requests (if any)
- Decision SLA target: client responses within 2 business days.

## 5) RACI (Lean)

- Founding Engineer: delivery owner, estimation sign-off, release sign-off.
- QA owner (assigned per project): test execution and defect triage.
- Client decision-maker: scope approvals and priority decisions.

## 6) Required Artifacts Per Project

- Scope lock document.
- Estimation sheet and milestone plan.
- QA test log and defect tracker.
- Release checklist and deployment notes.
- Handover runbook.
- Post-release retrospective notes.

## 7) Metrics to Track

- Estimate variance (%): committed vs actual.
- Defect escape rate: post-release defects per release.
- Cycle time: scope lock to production.
- On-time milestone rate.
- Change-request volume per project.

## 8) Escalation Rules

- If scope risk exceeds 15% schedule impact, escalate within 24 hours.
- If a blocker depends on client input > 2 business days, mark blocked and request decision in writing.
- If quality gate fails within 48 hours of planned launch, move release date and publish revised plan.
