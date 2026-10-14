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

## `CurrentStopDepartureRequested` and `CurrentStopDepartureResult`

Source: CP-0012 (program#185), protocol#13.

- The control server accepts a departure request only at a pickup stop at the fixed origin station of `STAGING_TO_WIRE`, the staging station. The message itself is not scoped to a task type, and the request is refused elsewhere.
- The onboard HMI journals the request before it sends it. Each press mints one `departureRequestId`; a resubmission of the same press, including after a restart, reuses it.
- The request echoes the worklist the vehicle shows: its `stationId`, `worklistRevision` and `operationSessionId`. `operationSessionId` is `null` when that worklist carries none, as every empty worklist does, so a vehicle holding cargo at the staging station with an empty worklist can still depart.
- The control server answers every request with `CurrentStopDepartureResult`. `REJECTED` carries a `Problem`: `WORKLIST_REVISION_STALE` when `worklistRevision` is not the current worklist revision of the vehicle's current stop (`currentWorklistRevision` names it), `STATION_MISMATCH` when `stationId` is not the vehicle's current stop, and `ACTION_NOT_ALLOWED_IN_STATE` when the stop is not a staging pickup stop or a slot operation runs or a load correction is open. A rejection changes no business state. `ACCEPTED` carries no `Problem`.
- After `ACCEPTED` the departure travels in the existing snapshots: `loadingPhase` `CLOSED` with `closedReason` `OPERATOR_DEPARTED`, the worklist and the plan. Demands not yet loaded are released back to dispatch, never cancelled or suppressed and never counted against the station-timeout release limit. When the stop ends with such demands the empty worklist carries `stopEndedReason` `OPERATOR_DEPARTED`. Loaded demands stay on the journey and the vehicle leaves through the correction gate and the `DEPARTURE` safety check as before. With nothing loaded the journey closes and the vehicle stays where it is.
- The same `departureRequestId` with the same content is answered with the result already given and has no second effect. With different content it is `BUSINESS_ID_CONTENT_CONFLICT` and is not applied.

## Charging with cargo within a `TRANSPORT` journey

Source: CP-0012 (program#185), protocol#13. No schema changes; both Schemas already allow these values.

- At a staging pickup stop with at least one basket loaded, a vehicle below the mandatory charge line takes its cargo to a charger within the same journey. `activePurpose` stays `TRANSPORT`; no purpose value is added.
- `VehicleBusinessStateSnapshot.chargingCycleState` is independent of `activePurpose`. Under `TRANSPORT` it is `NOT_CHARGING` unless the journey carries a charging stop, and then runs `ALLOCATED`, `EN_ROUTE`, `CHARGING`, `COMPLETE` or ends `UNABLE_TO_CHARGE`.
- `loadingPhase` closes with `closedReason` `CHARGING_REQUIRED`. Demands not yet loaded are released as for a departure, and when the stop ends with such demands the empty worklist carries `stopEndedReason` `CHARGING_REQUIRED`.
- `UpcomingStopPlanSnapshot` gains one leg with `stopPurposeCategory` `CHARGER`, `legType` `null` and `demandId` `null` between the staging stop and the existing dropoff stops. The onboard HMI opens no entry and no slot at it. After charging the journey continues to its dropoffs and does not return to the staging station.
- Every departure on a `TRANSPORT` journey, to and from the charger included, is a `PreDepartureSafetyCheck` with `checkPurpose` `DEPARTURE` carrying the journey's anchor demand, the leg and its target station. `NON_BUSINESS_MOVE` remains for idle return and charging outside a transport journey.
