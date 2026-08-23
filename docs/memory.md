# PEB Project Memory

## 1. Project Identity

**Project:** PEB Design, Analysis, Estimation & STAAD Model Generator

**Primary objective:** Build professional preliminary PEB design and
estimation software for structural designers and industry use.

**Target deliverable:** `PEB_DESIGN_ESTIMATION_STAAD_GENERATOR.xlsm` or
an equivalent professional application preserving the required Excel
workflow.

------------------------------------------------------------------------

## 2. Original Requirement Summary

The original specification requires:

-   building input;
-   automatic geometry;
-   STAAD nodes;
-   STAAD members;
-   member properties;
-   materials;
-   supports;
-   releases;
-   loads;
-   load combinations;
-   design commands;
-   real `.STD` export;
-   member schedule;
-   weight summary;
-   BOQ;
-   estimate;
-   dashboard;
-   design basis;
-   lookup data.

The final `.STD` must contain actual STAAD geometry and structural
commands, not dummy text.

------------------------------------------------------------------------

## 3. Updated Client Requirement

The client has changed the emphasis from a general Excel/STAAD generator
to **professional PEB design and estimation software**.

The most important updated requirement is:

> Steel quantity must be derived from actual building geometry, design
> loads, structural analysis, member design, section selection, spacing,
> bracing, purlins, girts and other relevant structural parameters.

Therefore:

**Fixed kg/m² cannot be the primary steel estimation method.**

------------------------------------------------------------------------

## 4. Existing Prototype

The supplied `index.html` is version V11.9.

It contains:

-   dashboard;
-   building configuration;
-   wind-location data;
-   design loads;
-   main-frame design;
-   crane controls;
-   3D/2D model;
-   member/estimate views;
-   project save/open;
-   CSV export;
-   STAAD export;
-   PDF report;
-   design-basis card.

The README records that V11.9 consolidated duplicate calculation
functions and made visible calculation, project save, CSV and STAAD
export use the same calculation pipeline.

------------------------------------------------------------------------

## 5. Important Legacy Behavior

The current V11.9 prototype has a `Practical PEB` mode where a benchmark
kg/m² value is used as a complete-building target and displayed
components are scaled to that target.

This is **not acceptable as the authoritative engineering quantity
engine under the updated client requirement.**

Migration rule:

``` text
LEGACY:
engineering estimate
    ↓
benchmark target
    ↓
scale components
    ↓
grand total

TARGET:
geometry
    ↓
actual members
    ↓
section properties
    ↓
member design
    ↓
actual lengths × unit masses
    ↓
component quantities
    ↓
grand total
```

The benchmark may remain only as a comparison/sanity-check metric.

------------------------------------------------------------------------

## 6. Current Verified Behaviors to Preserve Where Valid

The current README records:

-   duplicate calculation/export functions removed;
-   crane-on canvas crash fixed;
-   main frame rendering fixed;
-   save/export/STAAD use the authoritative calculation path;
-   unequal span inputs are saved;
-   crane load is applied only to designated supporting columns;
-   crane capacity affects column demand;
-   center-column connection marker issue was corrected;
-   V11.9 disclaimer was added;
-   syntax/headless tests were performed.

These are regression baselines, not proof of professional
structural-design certification.

------------------------------------------------------------------------

## 7. Engineering Basis

Primary Indian references to support the design-basis system:

-   IS 800 --- steel design.
-   IS 875 Part 1 --- dead loads.
-   IS 875 Part 2 --- imposed loads.
-   IS 875 Part 3 --- wind loads.
-   IS 875 Part 4 --- snow loads where applicable.
-   IS 875 Part 5 --- special loads/combinations where applicable.
-   IS 1893 --- seismic design where applicable.
-   NBC 2016 and applicable local/statutory requirements.
-   Additional applicable standards for cranes, materials, connections
    and foundations.

The exact edition must be stored per project.

------------------------------------------------------------------------

## 8. Core Engineering Principle

The software should think like a structural model, not like a costing
spreadsheet.

``` text
INPUT
 ↓
GEOMETRY
 ↓
ANALYTICAL MODEL
 ↓
LOADS
 ↓
ANALYSIS
 ↓
DESIGN
 ↓
MEMBER SELECTION
 ↓
QUANTITY
 ↓
BOQ
 ↓
ESTIMATE
```

Never reverse this flow by choosing a target weight first and forcing
the structure to match it.

------------------------------------------------------------------------

## 9. Quantity Source of Truth

For every member:

``` text
Member ID
Start node
End node
Length
Section
Unit mass
Quantity
Total mass
```

For plates/bolts:

``` text
Geometry/specification
×
quantity
×
validated material/unit mass
```

All component totals must be traceable.

------------------------------------------------------------------------

## 10. STAAD Source of Truth

The canonical structural model must feed STAAD export.

Do not manually maintain a separate STAAD model.

STAAD export must include actual:

-   joint coordinates;
-   member incidences;
-   member properties;
-   material;
-   supports;
-   releases;
-   loads;
-   load combinations;
-   analysis/design commands as supported.

------------------------------------------------------------------------

## 11. Reference STAAD File

The original requirement refers to a file named:

`Design model 2.STD`

If that file is available to the implementation agent, study its syntax
and organization.

Use it as a format reference.

Do not copy its numerical coordinates, loads or project-specific
dimensions.

------------------------------------------------------------------------

## 12. Required Engineering Modules

-   Project input
-   Geometry
-   Design basis
-   Wind
-   Loads
-   Primary frame
-   Secondary steel
-   Bracing
-   Crane
-   Mezzanine
-   Canopy
-   Openings
-   Connections
-   Base plate
-   Analysis
-   Member design
-   STAAD
-   Validation
-   Quantity
-   BOQ
-   Estimate
-   Reports

------------------------------------------------------------------------

## 13. AI Coding Agent Instructions

Before modifying code:

1.  Read this file.
2.  Read `PRD.md`.
3.  Read `Architecture.md`.
4.  Read `Rules.md`.
5.  Read `phases.md`.
6.  Inspect current source.
7.  Identify the active calculation path.
8.  Do not modify dead code as if it were active.
9.  Make targeted changes.
10. Test.
11. Record results.
12. Update this file if a permanent architectural decision changes.

------------------------------------------------------------------------

## 14. Completion Standard

A feature is not complete because:

-   the UI exists;
-   a button exists;
-   a number appears;
-   a `.STD` file downloads.

A feature is complete only when:

-   engineering logic exists;
-   data flows through the canonical model;
-   output is traceable;
-   validation exists;
-   relevant tests pass;
-   documentation is updated.

------------------------------------------------------------------------

## 15. Known Limitations

Unless independently implemented and validated, do not claim that the
system currently provides:

-   final structural certification;
-   final connection design;
-   final foundation design;
-   complete seismic design;
-   complete crane runway design;
-   complete STAAD analysis results;
-   issue-for-construction drawings.

------------------------------------------------------------------------

## 16. Engineering Disclaimer

Always retain:

> **PRELIMINARY DESIGN / ESTIMATION --- FINAL STRUCTURAL DESIGN TO BE
> VERIFIED BY QUALIFIED ENGINEER.**

------------------------------------------------------------------------

## 17. Current Project State

### Baseline (2026-08-22)

-   V11.9 single-file prototype frozen at `legacy/v11.9/`.
-   Original requirements at `docs/baseline/Original user requirements.txt`.
-   `Design model 2.STD` was **not** in the implementation package.
-   No prior full-stack app, database, or in-repo tests existed.
-   V11.9 Practical mode scales components to `kg/m² × area`. V11.9
    "engineering" mode still uses area × category rates — neither is
    member-driven.

### Completed

-   `docs/IMPLEMENTATION_PLAN.md`
-   Phase 1 canonical domain (`packages/engineering-core`) with
    serialize/deserialize tests
-   Prisma schema and API/auth foundation
-   Documentation stubs: README, SETUP, API, DATABASE, ENGINEERING_BASIS,
    TESTING, CHANGELOG

### Immediate Priority

Phase 2 geometry engine. Do not port benchmark scaling.

### Next Priority

Section/material catalog (Phase 3), then load engine (Phase 4).

------------------------------------------------------------------------

## 18. Decision Log

### Decision 001 --- Benchmark Is Not Engineering Truth

Status: **Accepted**

A kg/m² benchmark may be displayed for comparison but must not determine
structural steel quantity.

### Decision 002 --- One Canonical Structural Model

Status: **Accepted**

STAAD, quantity, BOQ and reports consume the same generated structural
model.

### Decision 003 --- Preliminary Engineering Status

Status: **Accepted**

The product is an automated preliminary design/estimation tool and
requires qualified-engineer verification.

### Decision 004 --- Standards Must Be Versioned

Status: **Accepted**

Every project stores the exact design-basis versions used.

### Decision 005 --- Full-stack is the calculation system of record

Status: **Accepted**

Excel/CSV remain export interfaces. Engineering authority is the backend
canonical model in PostgreSQL. The PRD `.xlsm` name is a workflow
deliverable, not the engine host.

### Decision 006 --- STAAD reference file missing

Status: **Open**

`Design model 2.STD` is required before locking STAAD serializer
formatting (Phase 11). Internal IR work can proceed; STAAD.Pro execution
validation is pending.

------------------------------------------------------------------------

## 19. Change Management

Whenever a future requirement conflicts with these principles:

1.  identify the conflict;
2.  record it;
3.  determine whether it affects engineering correctness;
4.  update PRD/Architecture/Rules if accepted;
5.  update this memory file;
6.  add regression tests.
