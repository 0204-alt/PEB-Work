# PEB Platform — Implementation Plan

**Date:** 2026-08-22  
**Application version (target):** `0.1.0-phase1`  
**Baseline inspected:** V11.9 unified-pipeline prototype + original Excel/STAAD requirements + six specification documents  

This plan is the migration contract. It does not replace `PRD.md`, `Architecture.md`, `Rules.md`, `phases.md`, or `design.md`.

---

## 0. Inspection outcome (Phase 0 evidence)

### Artifacts found

| Artifact | Location used for this assessment |
|---|---|
| Specification set | `RootDocumantation/` (copied to `docs/`) |
| V11.9 prototype | `legacy/v11.9/index.html` (copied from Downloads; was **not** in the workspace at inspection start) |
| V11.9 notes | `legacy/v11.9/README.txt` |
| Original requirements | `docs/baseline/Original user requirements.txt` |
| `Design model 2.STD` | **NOT FOUND** on Desktop, Downloads, or this workspace |

### What does **not** exist in this repository today

- No React/Vite frontend
- No Node API
- No PostgreSQL / Prisma / migrations
- No authentication
- No test suite in-repo
- No `.STD` reference file
- No Excel `.xlsm` deliverable

The “existing application” is a **single-file browser prototype** (~713 lines: HTML + CSS + one `<script>`). There is no backend and no database.

### Phase 0 exit criteria status

| Criterion | Status |
|---|---|
| Baseline documented | Met by this file + `legacy/v11.9/` |
| Reference STAAD syntax source available | **Not met** — `Design model 2.STD` missing. Syntax list is known from original requirements; STAAD.Pro-version-specific formatting is unknown |
| Current prototype can be run | Met — open `legacy/v11.9/index.html` in a browser |
| Known limitations documented | Met — §1 and §11–13 |

**Documented conflict (does not stop Phase 1):** original requirements allow user bay spacing and unequal final bay. V11.9 makes bay count/spacing **readonly** and auto-derives equal bays from a load-based planning rule (`autoGeometryFromLoads`). Target: user geometry wins; auto spacing is a suggestion only.

**Documented conflict:** PRD still lists Excel `.xlsm` as a primary deliverable; the agent brief requires a full-stack application. Target: full-stack is the engineering system of record; Excel/CSV export remains an interface, not the calculation engine.

---

## 1. Existing architecture

```text
Browser (index.html)
  ├─ DOM inputs (source of truth at runtime)
  ├─ v117Calc()  ← single live calculation function
  ├─ Canvas draw()  ← display-only geometry (X=length, Y=width, Z=height)
  ├─ generateSTAADText()  ← separate geometry walk for .STD
  ├─ exportCSV / projectData / exportPDF
  └─ local JSON save/open (no server)
```

**Authoritative live path:** `v117Calc()` → `calculate()` / CSV / save / STAAD.

### V11.9 UI modules (navigation)

Dashboard, 3D Model, Building, Main Frame, Secondary, Bracing, Crane, Mezzanine, Canopy, Openings, Plates & Conn., Base Plate, Estimate, BOQ, Drawing, Report, Settings.

Several nav targets only scroll/toast; they are not independent engineering modules.

### Calculation functions (complete inventory)

| Function | Role | Keep / replace |
|---|---|---|
| `benchmarkTargetMT`, `benchmarkChanged`, `applyBenchmarkLive` | `kg/m² × area` target | Isolate as comparison only |
| `autoGeometryFromLoads` | Equal bay count from DL+LL+0.5·wind | Replace with deterministic geometry engine |
| `rebuildSpanInputs`, `getSpans` | Unequal width spans (width is master; spans scaled to W) | Reuse idea; do not silently rescale without recording |
| `loads` | Wind `pz = 0.6 Vz²` (Vz in m/s, result kN/m² after `/1000`), tributary moments | Replace with design-basis load engine; do not hard-code unverified IS 875 clauses as “complete” |
| `anchorDesign` | Heuristic bolt qty/dia from tension screen | Replace with preliminary, sourced checks |
| `draw` / `P` | 3D/2D canvas | Reuse as viewer concept only |
| `generateSTAADText` / `exportSTAAD` | Real joints/members/loads text | Rebuild from canonical model; add validation gate |
| `craneLoadOnly` | Crane OFF = zero; ON = loads on supporting columns only | Preserve behavior; engineer the formulas |
| `v117Sections` | 5 hardcoded PB sections | Replace with versioned section database |
| `v117Select` / `selectRafterBelowColumn` | Lightest screening candidate with util≤1 | Replace with traced IS 800 checks; keep “record fail/pass” pattern |
| `v117Calc` | Quantities | **Replace** — see legacy quantity below |
| `calculate`, `exportCSV`, `exportPDF`, `projectData` | UI/export | Replace with backend-authored results |

### Legacy quantity (must not remain authoritative)

**Practical PEB mode (default in V11.9):**

1. Category rates from Neemrana 21,000 m² sheet (or engineering-mode area rates).
2. `structureSheetWt` from `area × rate` plus sheeting.
3. `practicalScale = benchmarkMT×1000 / structureSheetWt`.
4. Every displayed component is multiplied by `practicalScale` so the grand total **equals** `kg/m² × area`.

**Engineering-derived mode** still uses **area × category kg/m²** (`16.047`, `4.814`, …), not `Σ length × unit mass`. It is **not** member-driven. It must be replaced, not promoted.

Member schedule shows section `wt` (kg/m) and lengths, but **totals do not come from those rows**.

### Existing STAAD generation

`generateSTAADText()` produces a real text `.STD` with:

- `STAAD SPACE`, job info, `UNIT METER KN`
- Joint coordinates (X = length, Y = vertical, Z = width — **correct**)
- Member incidences for columns, rafters, girts, purlins, wall/roof X-bracing, optional crane runway/bridge
- `DEFINE MATERIAL` steel (E, Poisson, density, FY/FU)
- `MEMBER PROPERTY` as **PRIS YD/ZD** rectangles, not tapered/built-up syntax
- Pinned supports at bases
- LOAD 1–5, three or four `LOAD COMB`, `PERFORM ANALYSIS`, `FINISH`

Gaps versus PRD/Rules:

- No export-blocking validation
- No `PARAMETER` / `CHECK CODE`
- Purlins not on the actual roof plane (Y interpolated independently of Z)
- Missing wind ±Z and dedicated uplift case
- Combinations hardcoded, not design-basis-driven
- Properties not the designed tapered section
- STAAD.Pro execution never claimed in code, but UI does not state “internal validator only”
- Canvas uses Y = width, Z = height — **display convention differs from STAAD**; must not leak into the canonical model

### Reusable vs replace

**Reuse (ideas / data, not as production engine):**

- Module list and workstation layout (evolve toward `design.md`)
- India city → Vb lookup table (must be versioned and source-cited; treat as **unverified until checked against IS 875 Part 3**)
- Crane ON/OFF isolation
- Span-1..N persistence
- Single calculation pipeline discipline
- Disclaimer (update wording to the required PRELIMINARY DESIGN sentence)
- STAAD command order as a starting template

**Replace:**

- Benchmark scaling and area-rate steel
- Frontend-authoritative engineering
- Five-section catalog and memory-based screening formulas presented as design
- Canvas-as-model (no node/member objects persisted)
- JSON blob project file as the only storage
- Equal-bay auto geometry as the only grid

---

## 2. Target architecture

Monorepo, backend-authoritative, one canonical structural model.

```text
apps/web          React + Vite + TS   (engineering workstation UI — Phase 15)
apps/api          Express + TS        (REST /api/v1, authz, orchestrator)

packages/engineering-core   domain types, serialize, later engines
packages/database           Prisma schema + client
packages/shared             roles, API DTOs, units
packages/staad-generator    STAADDocument IR → .STD (Phase 11)
packages/validation         model + syntax validators (Phase 12)
```

Pipeline (Architecture §2 / PRD §9):

```text
Input → Design basis → Geometry → Structural model → Loads →
Analysis/design → Member selection → Validation →
STAAD / Quantity / BOQ / Estimate / Reports
```

Priority order remains: engineering correctness → traceability → data integrity → model integrity → validation → reproducibility → backend → database → UX → polish.

Analysis claim rule: generating `.STD` is **not** analysis. Native solver or STAAD.Pro results must exist before any “analysed” status.

---

## 3. Migration strategy

1. **Freeze** V11.9 under `legacy/v11.9/` (done). Do not edit it as production code.
2. **Phase 1:** canonical TypeScript domain + relational persistence + round-trip tests (this increment).
3. **Extract** V11.9 behaviors as regression fixtures (geometry numbers, crane off=0, city Vb map) without copying quantity scaling.
4. **Replace** quantity, loads, members, STAAD serializer module by module per `phases.md`.
5. **UI last** for dense workstation screens; do not rebuild a SaaS dashboard first.
6. Keep V11.9 openable for visual comparison until Phase 15.

No big-bang rewrite of the HTML file into React.

---

## 4. Database strategy

PostgreSQL + Prisma. **Not** a single project JSON blob.

Phase 1 tables (normalized, FK, UUID, `created_at`/`updated_at`):

- Identity: `users`, `project_users` (role enum)
- `projects`
- Catalog: `standards`, `standard_versions`, `material_grades`, `section_families`, `sections`
- Project engineering: `design_bases`, `project_geometries`, `grid_lines`, `bays`, `spans`, `nodes`, `members`, `member_groups`, `supports`, `releases`, `load_cases`, `load_applications`, `load_combinations`, `validation_results`
- Runs: `design_runs` (immutable snapshot hash + status; JSONB only for calculation snapshots)
- `audit_logs`

Later phases add: built-up/tapered section tables, secondary/bracing/crane/connection/quantity/BOQ/estimate/STAAD/report tables — when those engines exist.

JSONB allowed for: input snapshot on a design run, validator payload, STAAD IR snapshot. Not for the live member graph.

Transactions wrap a design run that writes nodes/members/loads together.

---

## 5. Backend strategy

Layered modules under `apps/api/src/modules/*`.

Controllers: HTTP only.  
Services: orchestration + authz.  
`engineering-core`: calculations and domain invariants.

API prefix `/api/v1`. Validate bodies with Zod. Never accept frontend-calculated weights as truth.

Auth: bcrypt password hashes, JWT access tokens, RBAC (`ADMIN`, `DESIGN_ENGINEER`, `ESTIMATOR`, `REVIEWER`, `VIEWER`). No localStorage-only auth.

Phase 1 API surface:

- `POST /api/v1/auth/register` (restricted in production later)
- `POST /api/v1/auth/login`
- `GET /api/v1/health`
- `POST /api/v1/projects` / `GET /api/v1/projects/:id`  
  Persist and return the canonical project document (relational reconstruct).

---

## 6. Engineering engine strategy

Central `calculateProject(projectId)` will be introduced when geometry+loads exist (Phase 2+). Phase 1 only persists and round-trips the **domain graph**.

Each implemented formula must carry: source, standard, edition, clause if known, units, assumptions. If unknown → `NOT_IMPLEMENTED` / `REQUIRES_ENGINEERING_REVIEW`, never a silent number.

Quantity: `qty × length × unitMass` (and plate/bolt equivalents). Benchmark kg/m² is comparison only.

Wind: location + geometry + versioned design basis. No universal wind value.

---

## 7. Frontend strategy

Do **not** start with a dashboard. Phase 15 migrates V11.9 into the `design.md` workstation:

- Neutral drafting palette, dense tables, project tree, properties panel, status bar
- Three.js / R3F only for the model viewer
- Viewer coordinates may map STAAD (X,Y,Z) → display; canonical storage stays X length, Y vertical, Z width

Phase 1 web app is a minimal Vite shell so the monorepo builds, not product UI.

---

## 8. STAAD strategy

1. Build canonical nodes/members (Phases 2–8).
2. Map to `STAADDocument` IR (Architecture §6).
3. Serialize with command order from original requirements.
4. Internal syntax/model validator; **block export** on critical errors.
5. Report: “STAAD syntax/model validation completed by internal validator. STAAD.Pro execution validation pending.” until STAAD.Pro is actually run.
6. When `Design model 2.STD` is supplied, align formatting only — never copy numbers.

---

## 9. Testing strategy

| Layer | Phase 1 | Later |
|---|---|---|
| Unit | serialize/deserialize, IDs, units, empty-model invariants | geometry, sections, loads, quantity, STAAD |
| Integration | project create/load via API + Postgres when available | calculation run persistence |
| E2E | deferred | create → calculate → STAAD → BOQ |
| Regression | fixtures from V11.9: crane off, span save, coordinate handedness | replace benchmark-total tests with “benchmark must not equal engineering total unless coincident” |

---

## 10. Phase-by-phase implementation order

Follow `phases.md` strictly. Do not skip a phase with critical failures.

| Phase | Focus | Notes |
|---|---|---|
| 0 | Baseline | This document; STD file still missing |
| **1** | Domain model + DB + auth foundation | Current increment |
| 2 | Geometry engine | Unequal bays/spans |
| 3 | Section/material DB | Versioned |
| 4 | Load engine | Traceable cases/combos |
| 5 | Primary frame design | Candidate trail |
| 6–9 | Secondary, bracing, crane, connections | Real members |
| 10 | Analysis integration | Do not fake “analysed” |
| 11–12 | STAAD + validation | Fail closed |
| 13–14 | Quantity/BOQ/estimate | No scaling |
| 15 | UI migration | Workstation, not SaaS |
| 16–18 | Regression, professional validation, RC | |
| 19 | Future | Foundations, detailed connections, etc. |

---

## 11. Risks

- Missing `Design model 2.STD` → STAAD formatting risk in Phase 11.
- Prototype “engineering” weights still area-based → easy to accidentally port.
- Uncited wind city table and `pz = 0.6 Vz²` presentation → must be tied to a versioned IS 875 Part 3 edition or marked unverified.
- Auto-equal bays vs user bay spacing.
- Duplicate `#impact` in V11.9; missing `#rail` control — crane rail level is unreliable in the prototype.
- Claiming analysis or STAAD.Pro execution without a solver.
- Excel vs full-stack dual-deliverable scope.

---

## 12. Unknowns

- Exact STAAD.Pro version for syntax compatibility.
- Authoritative edition dates for IS 800, IS 875 parts, IS 1893, NBC 2016 as adopted by the client.
- Whether crane-supporting steel is in building quantity (PRD yes when part of building; V11.9 excludes runway/girder from weight while still writing them to STAAD).
- Supplier crane data schema.
- Whether a native preliminary solver will be implemented or STAAD-assisted only (Architecture 4.6 A/B).

---

## 13. Required external references

1. `Design model 2.STD` — syntax/organization reference.
2. IS 800 (project-selected edition) — steel design.
3. IS 875 Parts 1–5 (editions) — loads/combinations as applicable.
4. IS 1893 (edition) if seismic enabled.
5. NBC 2016 / local authority rules as specified per project.
6. Validated rolled/built-up/cold-formed section tables and steel densities.
7. Crane manufacturer data when available.
8. STAAD.Pro installation for execution validation (not assumed in development).

Until (1) and (8) are available, STAAD work is limited to IR + internal validation.

---

## Immediate next step

Phase 1 (`phases.md`): canonical project/geometry/structural objects, serialize/deserialize without loss, PostgreSQL schema for those entities, authentication foundation, tests.
