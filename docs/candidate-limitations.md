# Candidate limitations and release finalization

The candidate intentionally uses structurally valid synthetic zero hashes inside envelope examples. Examples are schema fixtures, not evidence of a materialized release identity.

The manifest/approval circularity is resolved by the owner-approved governance separation recorded on 2026-08-25. `manifest/release.json` is an approval-neutral content snapshot and excludes `attestations/`; a completed external `release-approval.json` GitHub Release Asset binds the final immutable candidate commit and content manifest hash. The repository tracks only its blank Schema-governed template. G1 validates both artifacts and reports both hashes for the annotated tag and GitHub release metadata.

The current attestation remains `PENDING`. The two owners approved the governance amendment and the pre-amendment candidate commit `72ddde595165468520d9f3a46b25e4aa4eec0c3`; after this amendment is committed and the new content manifest hash is stable, both owners must approve that new exact commit/hash before `protocol-v0.1.0` is created.
