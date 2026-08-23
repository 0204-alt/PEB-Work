# PEB Software Engineering & Engineering Rules

## 1. Non-Negotiable Product Rules

1.  **Never use fixed kg/m² as the primary structural steel
    calculation.**
2.  Steel quantity must come from actual generated members and
    components.
3.  Any benchmark kg/m² value is a comparison/sanity-check value only.
4.  Never silently scale engineering results to match a benchmark.
5.  Every structural member must have a valid start node and end node.
6.  Every member must have a material and property.
7.  Every critical member must connect to the intended structural
    system.
8.  Critical validation errors must block STAAD export.
9.  Units must be explicit and internally consistent.
10. No hidden engineering constants.
11. All assumptions must be visible and stored.
12. All engineering overrides must be auditable.
13. Never present preliminary output as construction-ready design.
14. Do not claim analysis has been performed unless an actual analysis
    engine has run.
15. Do not claim STAAD validation unless the generated file has been
    opened/validated in an appropriate STAAD environment or equivalent
    parser/test.

------------------------------------------------------------------------

## 2. Source-of-Truth Rule

The canonical structural model is authoritative.

``` text
Canonical Model
 ├─ STAAD
 ├─ Member Schedule
 ├─ Weight
 ├─ BOQ
 └─ Reports
```

Do not create separate hidden calculations for each output.

------------------------------------------------------------------------

## 3. Geometry Rules

### 3.1 Coordinate System

Use:

-   X = building length;
-   Y = vertical;
-   Z = building width.

Base nodes must have the lowest appropriate Y coordinate.

Roof nodes must be above the eave.

### 3.2 Grid

-   Generate grid from actual dimensions.
-   Preserve unequal final bays.
-   Preserve unequal width spans.
-   Do not force equal spacing when the user specifies otherwise.
-   Never create duplicate grid coordinates.

### 3.3 Connectivity

Required checks include:

-   base → column;
-   column → rafter;
-   rafter → ridge/intermediate roof;
-   crane column → crane support;
-   purlin → frame;
-   girt → column;
-   bracing → actual nodes.

------------------------------------------------------------------------

## 4. Member Rules

Every member requires:

-   unique ID;
-   type;
-   start node;
-   end node;
-   section;
-   material;
-   length;
-   design group.

Member IDs must remain stable during one calculation run.

Recommended numbering ranges may be used for readability, but the ranges
must not become a hard-coded structural limitation.

------------------------------------------------------------------------

## 5. Tapered/Built-Up Member Rules

For tapered/built-up members, the system must calculate the actual
section geometry.

Required parameters may include:

-   depth;
-   web thickness;
-   flange width;
-   flange thickness;
-   taper;
-   length.

Unit mass must be derived from section geometry/material density or a
validated section database.

A text label such as `TAPERED COLUMN` is not sufficient to represent the
member in the STAAD model.

------------------------------------------------------------------------

## 6. Secondary Steel Rules

Purlins and girts must be real model members where included in the
structural model.

Their quantity must be:

``` text
number of members × actual length × actual unit mass
```

not:

``` text
building area × assumed kg/m²
```

------------------------------------------------------------------------

## 7. Bracing Rules

Bracing selected by the user must:

-   exist geometrically;
-   reference valid nodes;
-   have a property;
-   have a material;
-   appear in the STAAD model;
-   appear in the member schedule;
-   contribute to quantity where applicable.

------------------------------------------------------------------------

## 8. Crane Rules

When crane is OFF:

-   crane load case = zero/not generated;
-   crane-specific supporting member demand = not applied.

When crane is ON:

-   apply crane actions only to designated supporting structure;
-   use supplier data where available;
-   otherwise mark assumptions;
-   distinguish crane equipment weight from building structural steel;
-   include crane-supporting structural steel in the building quantity
    when it is actually part of the building.

Never spread crane load across every column unless the structural model
genuinely requires that load path.

------------------------------------------------------------------------

## 9. Load Rules

Loads must be separated into explicit load cases.

Examples:

-   DEAD;
-   LIVE;
-   COLLATERAL;
-   WIND +X;
-   WIND -X;
-   WIND +Z;
-   WIND -Z;
-   UPLIFT;
-   CRANE;
-   SEISMIC;
-   PROJECT-SPECIFIC.

Load combinations must reference load-case IDs, not duplicated raw
formulas.

------------------------------------------------------------------------

## 10. Indian Standards Rules

The design-basis database must identify applicable editions.

Core references:

-   IS 800 for steel design.
-   IS 875 Part 1 for dead loads.
-   IS 875 Part 2 for imposed loads.
-   IS 875 Part 3 for wind.
-   IS 875 Part 4 where snow applies.
-   IS 875 Part 5 for special loads/combinations where applicable.
-   IS 1893 for seismic design where applicable.
-   NBC 2016 and applicable authority/local requirements.
-   Additional applicable standards for cranes, materials, connections,
    foundations and cladding.

The exact standard edition must be confirmed at project setup and stored
with the project.

------------------------------------------------------------------------

## 11. Design Rules

### 11.1 Member Selection

Do not choose members solely from:

-   span;
-   area;
-   a fixed lookup;
-   kg/m².

Selection must consider applicable:

-   axial force;
-   shear;
-   bending;
-   combined actions;
-   slenderness;
-   stability;
-   effective length assumptions;
-   lateral restraint;
-   local slenderness;
-   serviceability.

### 11.2 Iteration

The member-design engine should iterate:

``` text
Candidate
 → Analyze
 → Check
 → Fail?
    → Next candidate
 → Pass?
    → Record
```

Select the lightest practical passing member subject to engineering
constraints.

------------------------------------------------------------------------

## 12. Quantity Rules

For each member:

``` text
Gross Weight = Quantity × Length × Unit Mass
```

For tapered members, use an appropriate geometry-derived average/unit
mass or validated integration method.

For plates:

``` text
Weight = volume × material density
```

For bolts:

``` text
Weight = quantity × validated unit mass
```

Connection allowances must be explicit.

------------------------------------------------------------------------

## 13. Benchmark Rules

Allowed:

-   `Benchmark kg/m²`;
-   historical project comparison;
-   warning band;
-   commercial sanity check.

Forbidden:

-   benchmark-driven member sizing;
-   benchmark-driven section selection;
-   hidden scaling;
-   forcing component totals to benchmark total.

If engineering weight is 612 MT and benchmark is 630 MT, report both
values. Do not silently convert 612 into 630.

------------------------------------------------------------------------

## 14. STAAD Rules

The generated `.STD` must be a real text-based model.

It must not be:

-   placeholder text;
-   a fake extension;
-   an empty shell;
-   a report disguised as STAAD.

Export must contain actual:

-   joints;
-   members;
-   properties;
-   materials;
-   supports;
-   releases where applicable;
-   loads;
-   combinations;
-   analysis/design commands as supported.

------------------------------------------------------------------------

## 15. Validation Rules

### Critical

-   duplicate node;
-   invalid member node;
-   disconnected primary member;
-   missing property;
-   missing material;
-   missing support;
-   invalid load reference;
-   invalid combination reference;
-   unit inconsistency;
-   invalid geometry.

### Warning

-   unusual utilization;
-   unusual steel intensity;
-   very slender member;
-   unusually large bay;
-   missing supplier crane data;
-   benchmark deviation;
-   engineering review required.

Critical = export blocked.

Warning = export allowed only with explicit acknowledgement where
appropriate.

------------------------------------------------------------------------

## 16. UI Rules

The UI must show:

-   current design basis;
-   current calculation status;
-   assumptions;
-   warnings;
-   critical errors;
-   model status;
-   engineering disclaimer.

Use clear states:

-   GREEN --- ready;
-   AMBER --- warning/review;
-   RED --- critical error.

------------------------------------------------------------------------

## 17. AI-Agent Rules

If an AI coding agent works on the project:

1.  Read `memory.md`.
2.  Read `PRD.md`.
3.  Read `Architecture.md`.
4.  Read `Rules.md`.
5.  Read the current `phases.md`.
6.  Inspect the existing implementation before modifying it.
7.  Never rewrite working modules without a reason.
8.  Make one coherent change at a time.
9.  Run tests after each structural-engine change.
10. Update `memory.md` when architecture or engineering decisions
    change.
11. Update `phases.md` after completing a phase.
12. Never claim a feature is complete without its validation evidence.

------------------------------------------------------------------------

## 18. Safety Rule

Display:

> **PRELIMINARY DESIGN / ESTIMATION --- FINAL STRUCTURAL DESIGN TO BE
> VERIFIED BY QUALIFIED ENGINEER.**

The software is an engineering aid, not a professional liability
substitute.
