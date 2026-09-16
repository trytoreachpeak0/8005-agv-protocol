# 8005-agv-protocol

The shared executable protocol contract for the `AGV_FULL_PRODUCT` profile. This
file is the agent's instructions for working here.

## Changing this repository: no advance approval, no announcement

**Zhengyu Shao decides this repository's content alone.** The earlier gate
requiring approval from both Zhengyu Shao and Kun Wang before any write was
removed on 2026-09-02.

An announcement duty replaced it, and **that is gone too, as of 2026-09-08**.
Until then every push had to be followed — in the same task — by an issue here
that `@SocialKKKK`, because this protocol was the contract his side implemented
against and a change could void his gate evidence. The user took over his project
outright, so neither premise holds: nobody else implements against this contract,
and there is no evidence of his left to void. **Do not open announcement issues,
and do not `@SocialKKKK` anything.**

What the rule was really tracking still matters: **a change here voids gate
evidence — ours now.** State which `FP-IS-*` slices a change touches and which
evidence it invalidates, in the commit message. The audience moved; the
accounting did not.

`main` is protected against force pushes and deletion, but does **not** require
a pull request — direct pushes are fine.

**Tagging a release is the exception and still needs an approval** — the product owner's, or an AI agent's that the owner authorized, see
"Releases are expensive" below.

## Collaboration workflow

`integration-slices/index.json` is the centre of the collaboration. It defines
`FP-IS-00` through `FP-IS-15`, each with a `sequence`, `prerequisites` and a
`definition`; each slice's `gates` array *is* the division of labour — `G1`
shared, `CONTROL_SERVER_G2` for `8005-agv-control-server`, `ONBOARD_HMI_G2` for
`8005-agv-onboard-hmi`, `G3` across both. The full account, written for humans
and in Chinese, lives at `8005-agv-program/docs/collaboration-workflow.md` in the
governance repository.

- **Contract ambiguities and errors are raised here** as issues carrying the
  `vectorId` that triggered them, plus each side's reading. An implementation
  that fails the contract is **not** raised here — it goes to that side's
  repository with G3 evidence attached.

## Releases are expensive, so batch changes

`docs/release-governance.md`: a patch release *"invalidates affected G1/G2/G3
evidence"*.

**One release here voids the G2 evidence on both sides and forces a full re-run.**
It has happened once already: `W2G-IS-01` was remapped to
`CV-DEMAND-ACCEPT-TO-PICKUP` in `protocol-v0.1.1`, so the `v0.1.0` G2 evidence
could not carry over.

So **batch protocol changes** rather than shipping them one at a time — each
small release costs both sides a full gate re-run.

Releases need **exactly one approval** in the attestation: the product owner, or
— since 2026-09-12 — an AI agent the product owner authorized, recorded as
`approverKind: AI_AGENT` together with `authorizedBy`. It was two product owners
until 2026-09-08 and the product owner alone until 2026-09-12. The
completed attestation stays out of git and is uploaded as a GitHub Release
asset, so that it changes neither the manifest hash nor the commit it approves.
**CI cannot approve.** The order is fixed: freeze and push the content
commit, generate the external attestation against that commit and manifest, run
G1 with `PROTOCOL_APPROVAL_ATTESTATION`, create the annotated
`protocol-v<SemVer>` tag carrying both hashes in its message, then publish the
same attestation as a release asset.

## What counts as breaking

Changes to required/type/enum/meaning/direction/delivery/dedup/persistence/
recovery/error/side-effect are breaking and require a ProtocolVersion and
release-major increase.

A conformance-index or trajectory correction may take a patch release **only**
when it restores an already approved responsibility boundary, changes no message
schema or wire semantics, and the release approver approves that compatibility
classification. Even then it changes the manifest and vector identity and voids
the affected G1/G2/G3 evidence.

## What is authoritative

The machine-readable content is authoritative: JSON Schema, the message
manifest, the error registry, valid and invalid examples, deterministic
trajectories, the runner and result contracts, and the integration-slice index.
**Markdown is explanatory only.**

`manifest/release.json` is an approval-neutral content snapshot. It hashes all
governed content except itself, `attestations/`, `.git/`, `node_modules/`,
`.github/` and generated `evidence/`.

Historical red evidence and released identities are immutable.

## Language

Agent instruction files — this one, and anything under `.claude/` — are written
in **English**.

Everything a human reads is written in **Chinese**: README files, documentation
prose, issue and pull-request titles and bodies, and commit message bodies.

Stay English inside Chinese text: conventional commit prefixes (`feat:`, `fix:`,
`docs:`, `chore:`), identifiers, paths, commands, environment variables, gate and
slice names (`G1`, `FP-IS-00`), and — most importantly — **protocol message
names, schema fields, `vectorId` values and error codes, which are the contract
itself and must never be translated.** Quote an error or a test result in its
original English first, then explain it in Chinese. Do not rewrite existing text
to match; this governs new writing.

## Repository visibility

This repository is **public**, and has been since 2026-09-14, when the product
owner made all eight component repositories public to stop private-repository
Actions artifacts from exhausting the account's storage quota. It was private
from 2026-09-02 until then, because a self-hosted GitHub Actions runner
(`win11-01-protocol`) executes jobs for this repository on the factory server and
a public repository lets anyone reach that machine through a pull request. **The
product owner accepted that cost knowingly.** Visibility is the product owner's
call alone: **do not switch this repository back to private, and do not add fork
pull-request approval or similar guards on your own initiative.**

## Scripting baseline

PowerShell 7. Do not write Windows PowerShell 5.1 compatible code, do not add
version probes or fallbacks, and do not invoke `powershell.exe` — call `pwsh`.
Every new `.ps1` opens with `#Requires -Version 7`.
