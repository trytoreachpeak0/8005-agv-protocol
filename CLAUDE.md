# 8005-agv-protocol

The shared executable protocol contract for the WIRE_TO_GATE MVP. This file is
the agent's instructions for working here.

## Changing this repository: no advance approval, but a mandatory announcement

**Zhengyu Shao decides this repository's content alone.** The earlier gate
requiring approval from both Zhengyu Shao and Kun Wang before any write was
removed on 2026-09-02.

What replaces it is an announcement after the fact. This protocol is the
contract Kun Wang's side implements against, and a change can void his gate
evidence, so he has to learn about every one:

- **After every push, open an issue here that `@SocialKKKK`**, stating three
  things: what changed, which `W2G-IS-*` slices it touches, and whether his
  `ONBOARD_HMI_G2` evidence is now void.
- **Announce in the same task as the push**, not later. This is the only hard
  process requirement in this repository.

`main` is protected against force pushes and deletion, but does **not** require
a pull request — direct pushes are fine.

**Tagging a release is the exception and still needs two signatures** — see
"Releases are expensive" below.

## Collaboration workflow

Two people drive this project. Kun Wang (GitHub `SocialKKKK`) owns
`8005-agv-onboard-hmi` and `slots-simulator`; Zhengyu Shao owns
`8005-agv-control-server`; this repository is jointly maintained. The full
account, written for humans and in Chinese, lives at
`8005-agv-program/docs/collaboration-workflow.md` in Zhengyu Shao's governance
repository.

- **This repository is the centre of the collaboration.**
  `integration-slices/index.json` defines `W2G-IS-00` through `W2G-IS-07`, each
  with a `sequence` and `prerequisites`; each slice's `gates` array *is* the
  division of labour — `G1` shared, `CONTROL_SERVER_G2` Zhengyu Shao,
  `ONBOARD_HMI_G2` Kun Wang, `G3` together. The progress board lives here too,
  as the issue labelled `wayfinder:map`.
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

Releases need **the product owner** in the approval attestation — exactly one,
since 2026-09-08. It was two until then; the second signature belonged to the
counterpart maintainer, and that role ended when the project was taken over. The
completed attestation stays out of git and is uploaded as a GitHub Release
asset, so that it changes neither the manifest hash nor the commit it approves.
**AI and CI cannot approve.** The order is fixed: freeze and push the content
commit, generate the external attestation against that commit and manifest, run
G1 with `PROTOCOL_APPROVAL_ATTESTATION`, create the annotated
`protocol-v<SemVer>` tag carrying both hashes in its message, then publish the
same attestation as a release asset.

## What counts as breaking

Changes to required/type/enum/meaning/direction/delivery/dedup/persistence/
recovery/error/side-effect are breaking and require a ProtocolVersion increase
and, while the release version is still `0.x`, a release-minor increase — under
SemVer a `0.x` minor **is** the breaking bump, and going to `1.0.0` would signal
a finished protocol rather than a breaking one. `protocol-v0.2.0` was cut this
way: ProtocolVersion 1 to 2, release 0.1.1 to 0.2.0. Once the release version
reaches `1.0.0`, breaking changes take a release-major increase instead.

A conformance-index or trajectory correction may take a patch release **only**
when it restores an already approved responsibility boundary, changes no message
schema or wire semantics, and both product owners approve that compatibility
classification. Even then it changes the manifest and vector identity and voids
the affected G1/G2/G3 evidence.

## What is authoritative

The machine-readable content is authoritative: JSON Schema, the message
manifest, the error registry, valid and invalid examples, deterministic
trajectories, the runner and result contracts, and the integration-slice index.
**Markdown is explanatory only.**

`manifest/release.json` is an approval-neutral content snapshot. It hashes all
governed content except itself, `attestations/`, `.git/`, `node_modules/` and
generated `evidence/`.

Historical red evidence and released identities are immutable.

## Language

Agent instruction files — this one, and anything under `.claude/` — are written
in **English**.

Everything a human reads is written in **Chinese**: README files, documentation
prose, issue and pull-request titles and bodies, and commit message bodies.

Stay English inside Chinese text: conventional commit prefixes (`feat:`, `fix:`,
`docs:`, `chore:`), identifiers, paths, commands, environment variables, gate and
slice names (`G1`, `W2G-IS-00`), and — most importantly — **protocol message
names, schema fields, `vectorId` values and error codes, which are the contract
itself and must never be translated.** Quote an error or a test result in its
original English first, then explain it in Chinese. Do not rewrite existing text
to match; this governs new writing.

This repository is private. It was public until 2026-09-02 and was switched
because the workspace now runs a self-hosted GitHub Actions runner on the
factory server, and a public repository would let anyone execute code on that
machine through a pull request. **Do not switch it back to public.** If the
protocol ever has to be presented externally, export the relevant documents
rather than opening the repository.

## Scripting baseline

PowerShell 7. Do not write Windows PowerShell 5.1 compatible code, do not add
version probes or fallbacks, and do not invoke `powershell.exe` — call `pwsh`.
Every new `.ps1` opens with `#Requires -Version 7`.
