# Wire notes

Explanatory notes on wire semantics that JSON Schema cannot carry. Machine-readable JSON Schema, errors, examples and vectors remain authoritative: where a note and a Schema disagree, the Schema wins and the note is a defect.

## Alarm code `SLOT_EXPECTED_ACTION_OVERDUE`

Source: CP-0005 section 4.1 (REQ-0358).

- `AlarmEntry.code` is an open set of strings, not an enum, so registering this code changes no schema.
- The onboard HMI raises it in `OnboardAlarmSnapshot` when the current slot of a slot operation has waited for the operator beyond the configured threshold.
- `subjectType` is `SLOT` and `subjectId` is the slot number.
- `raisedAt` is the instant the wait crossed the threshold.
- `displayMessage` is the action the vehicle expects.
- The time already waited is derived from `raisedAt` and the threshold. `OperationProgress` (`phase` `WAITING_OPERATOR`, `activeUnlockSlots`) may help, but it is `TELEMETRY` and can be lost, so it is never the basis.
- The slot readings (`lockState`, `physicalState`, `unlockOutputState`) are taken from `SafetyStateSnapshot`.
- This alarm is the precondition of `SlotFaultDeclarationCommand`: an administrator can declare a fault only on a current slot that has reported it (REQ-0359).

## `SublotEntryRequested.expiresOnRevisionChange`

Source: specification 23.5.

- The field stays `const: true`; neither its value nor its type changes.
- `true` means the entry request expires on a revision change, and a revision change is: the stop ended, the operation session or the station changed (a worklist for another operation session or station with a strictly higher revision), the worklist became empty (a worklist no older than the entry request with empty `items`), or the control server rejected the submission with `WORKLIST_REVISION_STALE`. A worklist revision advancing within the same operation session at the same station is not a revision change, and the entry request stays open.
- Separately from expiry, a `LOAD` `SlotOperationCommand` of the same operation session answers the entry request and so ends it.
