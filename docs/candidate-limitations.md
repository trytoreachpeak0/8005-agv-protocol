# Candidate limitations and release-finalization blocker

The candidate intentionally uses structurally valid synthetic zero hashes inside envelope examples. Examples are schema fixtures, not evidence of a materialized release identity.

The accepted governance currently creates a circular finalization dependency: the manifest is required to hash every file except itself, while the approval record is required to contain manifestSha256 and is itself included in the manifest file table. Filling the approval changes the manifest, which changes manifestSha256 again. Formal release must resolve this by an explicit human-approved governance amendment (for example, exclude the external approval attestation from the content manifest while binding it to the immutable candidate commit and manifest hash). G1 may pass the unapproved candidate; no tag/release may be created until the circularity is resolved.
