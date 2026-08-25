# Release governance

- ProtocolVersion is exactly 1 for this candidate; runtime negotiation is forbidden.
- `manifest/release.json` is an approval-neutral content snapshot. It hashes all governed protocol content except itself, `attestations/`, `.git/`, `node_modules/` and generated `evidence/`.
- `attestations/release-approval.template.json` is a tracked, blank template governed by its JSON Schema and excluded from the content manifest. A completed `release-approval.json` must remain external to Git and be uploaded as a GitHub Release Asset. This prevents the approval record from changing either the manifest hash or commit it approves.
- A formal release requires exact repository, SemVer, annotated tag, full commit, ProtocolVersion, profile, content manifest hash, approval-attestation hash, schema bundle hash and vectors hash.
- Both real product owners must approve the exact commit and content manifest hash in the attestation before an immutable tag/release is created. AI and CI cannot approve.
- G1 validates the content manifest and attestation independently, verifies an approved attestation points at the current content manifest, requires two distinct owners, and reports both hashes. Candidate G1 uses the tracked blank template. Release G1 sets `PROTOCOL_APPROVAL_ATTESTATION` to the external completed asset. The annotated tag message and GitHub release metadata must record both reported hashes.
- The attestation never contains its own hash. Its SHA-256 is computed from its final bytes and bound externally by the annotated tag and release metadata, avoiding another self-reference.
- Release order is fixed: freeze and push the content commit; generate the external attestation against that commit and manifest; run G1 with `PROTOCOL_APPROVAL_ATTESTATION`; create annotated `protocol-v<SemVer>` tag pointing at the frozen content commit with both hashes in its message; then publish the same attestation as a release asset.
- Required/type/enum/meaning/direction/delivery/dedup/persistence/recovery/error/side-effect changes are breaking and require a ProtocolVersion and release-major increase.
- Historical red evidence and released identities are immutable.
