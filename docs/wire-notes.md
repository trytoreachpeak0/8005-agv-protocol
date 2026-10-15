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

Source: CP-0012 (program#185) section 3, protocol#13; CP-0014 (program#191) section 3 item 4, protocol#17.

- A staging pickup stop is a pickup stop at the fixed origin station of `STAGING_TO_WIRE`, the staging station. Pickup stops at machine stations keep every rule below unchanged.
- `CurrentStopWorklistSnapshot.stationDepartureDeadlineAt` is always `null` at a staging pickup stop: the stop has no station departure deadline and no countdown.
- At a staging pickup stop `VehicleBusinessStateSnapshot.loadingPhase` is `state` `CARGO_HOLDING_WAIT` with `cargoHoldingDeadlineAt` `null` while no basket is loaded: the vehicle waits with no cargo-holding deadline, as the program#94 table gives `null` before the first load batch closes safely.
- Once a basket is loaded `cargoHoldingDeadlineAt` is set, counted from the safe closure of the load batch that put cargo on board, with the same duration as at a machine pickup stop. Each demand with this station as its pickup station appended to the vehicle afterwards moves it to the time of the append plus that duration; a release, a cancellation or any other worklist change does not move it. This is the one difference from a machine pickup stop, whose `cargoHoldingDeadlineAt` never moves once given. If the cargo is undone until no basket is loaded, the deadline returns to `null`, and the next loaded basket sets it afresh.
- When the cargo-holding deadline expires at a staging pickup stop, the loading phase ends as at a machine pickup stop: `loadingPhase` is `CLOSED` with `closedReason` `CARGO_HOLDING_TIMEOUT`, the loaded demands stay on the journey, and demands not yet loaded are released back to dispatch, never cancelled or suppressed and never counted against the station-timeout release limit; the empty worklist then carries `stopEndedReason` `DEMAND_RELEASED`, as at a machine pickup stop. The expiry does not interrupt a running slot operation, load correction or cancellation; the phase ends once it settles. The vehicle leaves through the correction gate and the `DEPARTURE` safety check as before, with no further correction grace.
- When a staging pickup stop ends because the operator departed or because the vehicle must charge, and demands not yet loaded are released back to dispatch, the empty worklist carries `stopEndedReason` `OPERATOR_DEPARTED` or `CHARGING_REQUIRED`, never `DEMAND_RELEASED` and never a timeout reason: those two belong to the expiry above. When every demand of the stop is loaded the vehicle leaves as before and no empty worklist is sent. A vehicle holding cargo already shows an empty worklist; if the control server sends another one after a departure, it carries `OPERATOR_DEPARTED`.

## `CurrentStopDepartureRequested` and `CurrentStopDepartureResult`

Source: CP-0012 (program#185) section 3, protocol#13; CP-0014 (program#191) section 3 item 4, protocol#17.

- The control server accepts a departure request at a staging pickup stop, and at a machine pickup stop once every load committed to that stop is complete, at least one basket is loaded and the vehicle has not yet asked to leave, whether `loadingPhase` is still `CARGO_HOLDING_WAIT` or has already ended (`VEHICLE_FULL` or `CLOSED`) and only the station departure wait remains. The message itself is not scoped to a task type, and the request is refused elsewhere.
- The onboard HMI journals the request before it sends it. Each press mints one `departureRequestId`; a resubmission of the same press, including after a restart, reuses it.
- The request echoes the worklist the vehicle shows: its `stationId`, `worklistRevision` and `operationSessionId`. The control server identifies the stop by `stationId` and `worklistRevision`. `operationSessionId` is `null` when that worklist carries none, as every empty worklist does, so a vehicle holding cargo at the staging station with an empty worklist can still depart.
- The control server answers every request with `CurrentStopDepartureResult`. It checks in this order and the first check that fails decides: `STATION_MISMATCH` when `stationId` is not the vehicle's current stop; `WORKLIST_REVISION_STALE` when `worklistRevision` is not the current worklist revision of that stop (`currentWorklistRevision` names it); `ACTION_NOT_ALLOWED_IN_STATE` when the stop accepts no departure in its present state: a machine pickup stop whose committed loads are not all complete or that has no basket loaded, a stop that is not a pickup stop, a vehicle that has already asked to leave, a running slot operation or an open load correction. A `REJECTED` result carries that `Problem` and changes no business state. `ACCEPTED` carries no `Problem`.
- After `ACCEPTED` the departure travels in the existing snapshots. At a staging pickup stop it goes as follows. With at least one basket loaded, `loadingPhase` is `CLOSED` with `closedReason` `OPERATOR_DEPARTED`, the loaded demands stay on the journey, and the vehicle leaves through the correction gate and the `DEPARTURE` safety check as before. With nothing loaded the journey closes, `loadingPhase` is `null`, and the vehicle stays where it is. Either way demands not yet loaded are released back to dispatch, never cancelled or suppressed and never counted against the station-timeout release limit.
- At a machine pickup stop accepted in `CARGO_HOLDING_WAIT`, the departure counts as the cargo-holding deadline expiring now: `loadingPhase` is `CLOSED` with `closedReason` `OPERATOR_DEPARTED`, not `CARGO_HOLDING_TIMEOUT`, so the vehicle tells a press from an expiry; the loaded demands stay on the journey, and appended stops not yet loaded are released back to dispatch as on a cargo-holding timeout, never cancelled or suppressed and never counted against the station-timeout release limit. Accepted after `loadingPhase` has ended, `loadingPhase` stays as it was, `closedReason` included. Either way the stop ends at once: the vehicle does not wait out the rest of the station departure deadline (`stationDepartureDeadlineAt`), keeps no correction grace, and leaves through the correction gate and the `DEPARTURE` safety check; an empty worklist sent for it carries `stopEndedReason` `OPERATOR_DEPARTED`.
- The same `departureRequestId` with the same content is answered by replaying the stored result exactly as it was first decided, `currentWorklistRevision` included, never recomputed, and has no second effect.
- The same `departureRequestId` with different content is answered with `ProtocolProblem` carrying `BUSINESS_ID_CONTENT_CONFLICT`. No `CurrentStopDepartureResult` is sent for it and it is not applied.

## Charging required at a staging pickup stop

Source: CP-0013 (program#188) section 3, protocol#15. It replaces the charging stop CP-0012 section 3 gave this candidate: the vehicle delivers its cargo first and charges afterwards. No schema changes; the Schemas already allow these values.

- At a staging pickup stop with at least one basket loaded and no slot operation running, a vehicle below the mandatory charge line departs as for an accepted departure, decided by the control server and not by an operator. `loadingPhase` is `CLOSED` with `closedReason` `CHARGING_REQUIRED`, the loaded demands stay on the journey, and demands not yet loaded are released back to dispatch, never cancelled or suppressed and never counted against the station-timeout release limit. The vehicle leaves through the correction gate and the `DEPARTURE` safety check as before.
- The journey goes on to its existing dropoff stops and carries no charging stop: `UpcomingStopPlanSnapshot` gains no `CHARGER` leg, `activePurpose` stays `TRANSPORT` and `chargingCycleState` stays `NOT_CHARGING` while the journey lasts. `batteryState` may read `MANDATORY_CHARGE` meanwhile; the journey is not interrupted to charge. Every departure on it is a `PreDepartureSafetyCheck` with `checkPurpose` `DEPARTURE`, as on any transport journey.
- Once the journey ends the existing charging allocation takes the vehicle, as it takes any vehicle without a purpose below the mandatory charge line: `activePurpose` becomes `CHARGING`, its moves are `NON_BUSINESS_MOVE` checks, and `chargingCycleState` runs from there. The vehicle does not return to the staging station before it charges.
- Without cargo the journey closes instead, `loadingPhase` is `null`, and the existing charging allocation takes the vehicle, so `closedReason` `CHARGING_REQUIRED` appears only with cargo on board.
