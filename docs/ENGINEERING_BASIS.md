# Engineering basis

Phase 1 does **not** implement design formulas.

## Recorded standards (catalog only)

Editions are stored as `TO_BE_CONFIRMED` until selected per project:

- IS 800
- IS 875 Parts 1–5
- IS 1893
- NBC 2016

No clause numbers or capacities are computed from memory.

## Coordinate system

- X = building length (m)
- Y = vertical (m)
- Z = building width (m)

Column bases have the lowest Y. This is independent of the V11.9 canvas mapping (display Y = width).

## Quantity (target; not implemented)

`weight = quantity × length × unit mass`

Benchmark kg/m² may be stored on the project as comparison. It must not scale members.

## Wind / loads / IS 800 checks

Status: `NOT_IMPLEMENTED`. V11.9 expressions (including `pz = 0.6 × Vz²` presentation and city Vb map) are legacy and must be re-implemented against a cited edition before use.

## STAAD

Not generated in Phase 1. Export is blocked when the model is empty (`MODEL_EMPTY`).
