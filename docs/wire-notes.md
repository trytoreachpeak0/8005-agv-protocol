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

## Staging pickup stops

Source: CP-0012 (program#185) section 3, protocol#13.

- A staging pickup stop is a pickup stop at the fixed origin station of `STAGING_TO_WIRE`, the staging station. Pickup stops at machine stations keep every rule below unchanged.
- `CurrentStopWorklistSnapshot.stationDepartureDeadlineAt` is always `null` at a staging pickup stop: the stop has no station departure deadline and no countdown.
- `VehicleBusinessStateSnapshot.loadingPhase` may be `state` `CARGO_HOLDING_WAIT` with `cargoHoldingDeadlineAt` `null` at a staging pickup stop: the vehicle holds its cargo and waits, with no cargo-holding deadline. The program#94 table gives `null` only before the first load batch closes safely or where cargo-holding wait does not apply; this is the one further case.
- When a staging pickup stop ends because the operator departed or because the vehicle must charge, and demands not yet loaded are released back to dispatch, the empty worklist carries `stopEndedReason` `OPERATOR_DEPARTED` or `CHARGING_REQUIRED`, never `DEMAND_RELEASED` and never a timeout reason. When every demand of the stop is loaded the vehicle leaves as before and no empty worklist is sent. A vehicle holding cargo already shows an empty worklist; if the control server sends another one after a departure, it carries `OPERATOR_DEPARTED`.

## `CurrentStopDepartureRequested` and `CurrentStopDepartureResult`

Source: CP-0012 (program#185) section 3, protocol#13.

- The control server accepts a departure request only at a staging pickup stop. The message itself is not scoped to a task type, and the request is refused elsewhere.
- The onboard HMI journals the request before it sends it. Each press mints one `departureRequestId`; a resubmission of the same press, including after a restart, reuses it.
- The request echoes the worklist the vehicle shows: its `stationId`, `worklistRevision` and `operationSessionId`. The control server identifies the stop by `stationId` and `worklistRevision`. `operationSessionId` is `null` when that worklist carries none, as every empty worklist does, so a vehicle holding cargo at the staging station with an empty worklist can still depart.
- The control server answers every request with `CurrentStopDepartureResult`. It checks in this order and the first check that fails decides: `STATION_MISMATCH` when `stationId` is not the vehicle's current stop; `WORKLIST_REVISION_STALE` when `worklistRevision` is not the current worklist revision of that stop (`currentWorklistRevision` names it); `ACTION_NOT_ALLOWED_IN_STATE` when the stop is not a staging pickup stop, a slot operation runs or a load correction is open. A `REJECTED` result carries that `Problem` and changes no business state. `ACCEPTED` carries no `Problem`.
- After `ACCEPTED` the departure travels in the existing snapshots. With at least one basket loaded, `loadingPhase` is `CLOSED` with `closedReason` `OPERATOR_DEPARTED`, the loaded demands stay on the journey, and the vehicle leaves through the correction gate and the `DEPARTURE` safety check as before. With nothing loaded the journey closes, `loadingPhase` is `null`, and the vehicle stays where it is. Either way demands not yet loaded are released back to dispatch, never cancelled or suppressed and never counted against the station-timeout release limit.
- The same `departureRequestId` with the same content is answered by replaying the stored result exactly as it was first decided, `currentWorklistRevision` included, never recomputed, and has no second effect.
- The same `departureRequestId` with different content is answered with `ProtocolProblem` carrying `BUSINESS_ID_CONTENT_CONFLICT`. No `CurrentStopDepartureResult` is sent for it and it is not applied.

## Charging with cargo within a `TRANSPORT` journey

Source: CP-0012 (program#185) section 3, protocol#13. No schema changes; the Schemas already allow these values.

- At a staging pickup stop with at least one basket loaded, a vehicle below the mandatory charge line takes its cargo to a charger within the same journey. `activePurpose` stays `TRANSPORT`; no purpose value is added. Without cargo the journey closes instead, `loadingPhase` is `null`, and the existing charging allocation takes the vehicle, so `closedReason` `CHARGING_REQUIRED` appears only with cargo on board.
- `VehicleBusinessStateSnapshot.chargingCycleState` is independent of `activePurpose`. Under `TRANSPORT` it is `NOT_CHARGING` unless the journey carries a charging stop, and then runs `ALLOCATED`, `EN_ROUTE`, `CHARGING`, `COMPLETE` or ends `UNABLE_TO_CHARGE`.
- `loadingPhase` closes with `closedReason` `CHARGING_REQUIRED`. Demands not yet loaded are released as for a departure.
- `UpcomingStopPlanSnapshot` gains one leg with `stopPurposeCategory` `CHARGER`, `legType` `null` and `demandId` `null` between the staging stop and the existing dropoff stops. The onboard HMI opens no entry and no slot at it. After charging the journey continues to its dropoffs and does not return to the staging station.
- Under `TRANSPORT` all three values of `UnableToChargeFieldConfirmationResult.chargingPolicyDecision` apply and none ends the journey or releases its cargo. `RETRY_LATER`: the vehicle stays at or before the charger and retries later. `REASSIGN_CHARGER`: the journey's charging stop moves to another charger. `MANUAL_CHARGING_HOLD`: the vehicle stops with its cargo on board; once the hold is lifted from the onboard HMI (return to service after charging), the journey continues to its existing dropoff stops and does not return to the staging station. No decision skips charging and goes straight to the dropoffs.
- Every departure on a `TRANSPORT` journey, to and from the charger included, is a `PreDepartureSafetyCheck` with `checkPurpose` `DEPARTURE` carrying the journey's anchor demand after any re-anchoring, which is a loaded demand, together with the leg and its target station. `NON_BUSINESS_MOVE` remains for idle return and charging outside a transport journey.
