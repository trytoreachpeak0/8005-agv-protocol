# Candidate limitations and release finalization

The candidate intentionally uses structurally valid synthetic zero hashes inside envelope examples. Examples are schema fixtures, not evidence of a materialized release identity.

The manifest/approval circularity is resolved by the owner-approved governance separation recorded on 2026-08-25. `manifest/release.json` is an approval-neutral content snapshot and excludes `attestations/`; a completed external `release-approval.json` GitHub Release Asset binds the final immutable candidate commit and content manifest hash. The repository tracks only its blank Schema-governed template. G1 validates both artifacts and reports both hashes for the annotated tag and GitHub release metadata.

`protocol-v0.1.0` and `protocol-v0.1.1` remain immutable; both were created with an approved external attestation. The current `0.2.0` superseding candidate is **breaking** and raises ProtocolVersion from 1 to 2. Its attestation remains `PENDING`; both product owners must approve the new exact commit, content manifest hash, vectors hash and the breaking classification before `protocol-v0.2.0` can be created.

The `0.2.0` candidate removes the single-demand narrowing the MVP had frozen into the contract: `CurrentStopWorklistSnapshot.items` accepts up to the vehicle's eight slots instead of exactly one, `UpcomingStopPlanSnapshot.legs` accepts a stop sequence instead of exactly two legs and gains `TO_CHARGER`, `SublotEntryRequested` carries `expectedSublots` (the sublots still enterable within this dispatch range, per FR-001 AC-3 and BR-001) instead of a single `expectedSublot`, and `LoadCancellationResult.slotResults` allows the empty result that ADR-cross-0046 requires when no slot operation was ever commanded.
