# PEB Engineering Usebook

This manual documents specific engineering rules and conventions implemented in the core platform.

## 1. Units
The canonical unit system is SI:
- Length / Displacement: Meters (`m`) or Millimeters (`mm`) explicitly defined by field names.
- Force: Kilonewtons (`kN`).
- Moment / Torsion: Kilonewton-meters (`kNm`).
- Mass: Kilograms (`kg`).
- Stresses / Strengths (Yield, Tensile, Elastic Modulus): Megapascals (`MPa`).

## 2. Engineering Review States
Various results and models might end up in a `REQUIRES_ENGINEERING_REVIEW` state. This explicitly means that a certified structural engineer must manually intervene, provide input, or review assumptions.
- **Analysis Integration**: If no real analysis solver is attached, the system will fallback to `UnavailableAnalysisProvider`. This provider does *not* fabricate zero-loads or arbitrary deformations. It yields empty result sets and flags the run as `REQUIRES_ENGINEERING_REVIEW` / `ANALYSIS_BLOCKED`.
- **Connections**: Any placeholder connection or uncalculated structural tie defaults to `NOT_YET_DEFINED` or `REQUIRES_ENGINEERING_REVIEW`.

## 3. Stale Analysis
Any modification to the input structural model (materials, section geometries, node positions, loads, load cases) automatically changes the deterministic hash (`computeAnalysisHash()`). When this hash mismatches the hash of the latest analysis run, the analysis is deemed `STALE_ANALYSIS`.
