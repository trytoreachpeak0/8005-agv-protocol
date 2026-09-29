# 8005-agv-protocol

Shared executable protocol contracts for the 8005 AGV full product
(`AGV_FULL_PRODUCT`).

## Current state

The repository currently contains an **unapproved `3.0.0` superseding content
snapshot** for `ProtocolVersion = 4` and profile `AGV_FULL_PRODUCT`.
`protocol-v2.0.0` remains immutable, and `protocol-v3.0.0` does not exist yet.

This candidate is **breaking** against `protocol-v2.0.0`
(`BREAKING_PROTOCOL_VERSION_INCREASE`, `INCOMPATIBLE_EXACT_IDENTITY_REQUIRED`):
ten changes — slot fault declaration (`SlotFaultDeclarationCommand` /
`SlotFaultDeclarationResult`, `SLOT_FAULT_DECLARED`), `supportsBatchUnlock`
removed from `CapabilitySnapshot`, a named cargo handoff on
`ForcedMechanicalRecoveryResult`, a `closedReason` on
`ExceptionRecoverySessionSnapshot` (`RECOVERY_ACTION_RESULT_NOT_RECONCILED`),
the onboard assertion `DISPLAY_ADMISSION_BLOCK_REASON` dropped from `FP-IS-10`,
`ONBOARD_FATAL_FAULT_LATCHED`, a `stopEndedReason` on
`CurrentStopWorklistSnapshot`, a description for
`SublotEntryRequested.expiresOnRevisionChange`, the `ALL_EMPTY_DOOR_UNPROVEN`
outcome with `SLOT_DOOR_LOCK_UNPROVEN_AFTER_EMPTY` and the
`HARDWARE_REPAIR_RELEASE` recovery action, and a required `checkPurpose` on
`PreDepartureSafetyCheck` / `PreDepartureSafetyCheckResult`. See
[`compatibility/report.json`](compatibility/report.json) for the full list.

It is not a formal `ProtocolRelease` until a release approval (the product
owner, or an AI agent the product owner authorized) covers its exact commit,
manifest, vectors hash and compatibility classification. Both sides consume it
as a candidate: `ApprovalStatus = SUPERSEDING_CANDIDATE`, and gate evidence
produced on it is `UNRELEASED_CANDIDATE` and does not count towards a batch
exit.

Machine-readable JSON Schema, the message manifest, error registry, valid and
invalid examples, deterministic trajectories, runner/result contracts, and the
integration-slice index are authoritative. Markdown is explanatory only.

```powershell
pnpm install --frozen-lockfile
pnpm manifest:finalize
pnpm g1
```

See:

- [`manifest/release.json`](manifest/release.json)
- [`attestations/release-approval.template.json`](attestations/release-approval.template.json)
- [`docs/README.md`](docs/README.md)
- [`docs/release-governance.md`](docs/release-governance.md)
- [`docs/candidate-limitations.md`](docs/candidate-limitations.md)
- [`compatibility/report.json`](compatibility/report.json)
- [`compatibility/implementation-version-matrix.json`](compatibility/implementation-version-matrix.json)
- [`evidence/g1-result.json`](evidence/g1-result.json)

G1 PASS proves candidate-internal consistency only. It does not prove G0 human
approval, either product implementation, G2/G3, real RIoT, real IO, target
hardware, or factory qualification.
