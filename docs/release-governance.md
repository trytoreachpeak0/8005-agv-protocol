# Release governance

- ProtocolVersion is exactly 1 for this candidate; runtime negotiation is forbidden.
- A formal release requires exact repository, SemVer, annotated tag, full commit, ProtocolVersion, profile, manifest hash, schema bundle hash and vectors hash.
- Both real product owners must approve the exact commit and manifest before an immutable tag/release is created. AI and CI cannot approve.
- Required/type/enum/meaning/direction/delivery/dedup/persistence/recovery/error/side-effect changes are breaking and require a ProtocolVersion and release-major increase.
- Historical red evidence and released identities are immutable.
