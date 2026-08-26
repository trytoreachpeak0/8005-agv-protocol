# Candidate limitations and release finalization

The candidate intentionally uses structurally valid synthetic zero hashes inside envelope examples. Examples are schema fixtures, not evidence of a materialized release identity.

The manifest/approval circularity is resolved by the owner-approved governance separation recorded on 2026-08-25. `manifest/release.json` is an approval-neutral content snapshot and excludes `attestations/`; a completed external `release-approval.json` GitHub Release Asset binds the final immutable candidate commit and content manifest hash. The repository tracks only its blank Schema-governed template. G1 validates both artifacts and reports both hashes for the annotated tag and GitHub release metadata.

`protocol-v0.1.0` remains immutable. The current `0.1.1` superseding candidate corrects the W2G-IS-01 conformance mapping without changing message Schema or wire semantics. Its attestation remains `PENDING`; both product owners must approve the new exact commit, content manifest hash, vectors hash and non-breaking classification before `protocol-v0.1.1` can be created.
