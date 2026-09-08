# 8005-agv-protocol

Shared executable protocol contracts for the 8005 AGV WIRE_TO_GATE MVP.

## Current state

The repository currently contains an **unapproved `0.3.0` superseding content
snapshot** for `ProtocolVersion = 3` and profile `WIRE_TO_GATE_MVP`.
`protocol-v0.1.0`, `protocol-v0.1.1` and `protocol-v0.2.0` remain immutable.
This candidate is **breaking**: the three server-to-vehicle recovery messages
now carry the slot operation attempt identity the vehicle needs to raise a
compensation request, `CurrentStopWorklistSnapshot` carries the server-owned
station departure deadline the vehicle displays, and `OPERATOR_TIMEOUT` joins
the error registry. It is not a formal `ProtocolRelease` until the product
owner approves its exact commit, manifest, vectors hash and compatibility
classification.

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
- [`compatibility/implementation-version-matrix.json`](compatibility/implementation-version-matrix.json)
- [`evidence/g1-result.json`](evidence/g1-result.json)

G1 PASS proves candidate-internal consistency only. It does not prove G0 human
approval, either product implementation, G2/G3, real RIoT, real IO, target
hardware, or factory qualification.
