# PEB Design, Analysis, Estimation & STAAD Generator --- Architecture

## 1. Architecture Principles

1.  **Single Source of Truth:** one canonical structural model feeds
    STAAD generation, quantities, BOQ and reports.
2.  **Geometry Before Quantity:** steel quantity is a consequence of
    generated members.
3.  **Design Basis Is Explicit:** every calculation records the
    standard, edition, assumptions and factors used.
4.  **Deterministic Generation:** identical inputs and design-basis
    versions should produce identical model IDs/output, apart from
    timestamps.
5.  **Auditability:** every result must be traceable to inputs,
    formulas, members and sections.
6.  **Fail Closed:** critical model inconsistencies block export.
7.  **No Hidden Benchmark Scaling:** commercial benchmarks cannot alter
    engineering results.
8.  **Versioned Engineering Data:** standards, section properties,
    material grades and lookup data are versioned.
9.  **Separation of Concerns:** UI, geometry, loads, analysis/design,
    quantities and export remain separate modules.
10. **Professional Review:** automation assists engineering; it does not
    replace responsible design review.

------------------------------------------------------------------------

## 2. Logical Architecture

``` text
┌──────────────────────────────┐
│            UI                │
│ Inputs / Views / Reports     │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│      Project Orchestrator    │
│ Validation / Run Management  │
└──────────────┬───────────────┘
               │
       ┌───────┴────────┐
       ▼                ▼
┌─────────────┐  ┌───────────────┐
│ Design Basis│  │ Project Model │
└──────┬──────┘  └──────┬────────┘
       │                 │
       └────────┬────────┘
                ▼
       ┌───────────────────┐
       │ Geometry Engine   │
       └─────────┬─────────┘
                 ▼
       ┌───────────────────┐
       │ Structural Model  │
       └─────────┬─────────┘
                 ▼
       ┌───────────────────┐
       │ Load Generator    │
       └─────────┬─────────┘
                 ▼
       ┌───────────────────┐
       │ Analysis / Design │
       └─────────┬─────────┘
                 ▼
       ┌───────────────────┐
       │ Member Selection  │
       └─────────┬─────────┘
                 ▼
       ┌───────────────────┐
       │ Validation Engine │
       └───────┬───┬───────┘
               │   │
       ┌───────┘   └─────────────┐
       ▼                         ▼
┌──────────────┐          ┌──────────────┐
│ STAAD Export │          │ Quantity/BOQ │
└──────┬───────┘          └──────┬───────┘
       │                         │
       ▼                         ▼
  `.STD` file              Estimate/Reports
```

------------------------------------------------------------------------

## 3. Canonical Domain Model

### Project

``` text
Project
 ├─ metadata
 ├─ geometry
 ├─ designBasis
 ├─ loads
 ├─ materialSpec
 ├─ frameConfig
 ├─ secondaryConfig
 ├─ bracingConfig
 ├─ craneConfig
 ├─ mezzanineConfig
 ├─ canopyConfig
 ├─ openings
 └─ commercialConfig
```

### Node

``` text
Node
 ├─ id
 ├─ x
 ├─ y
 ├─ z
 ├─ role
 ├─ gridLine
 ├─ bay
 └─ metadata
```

### Member

``` text
Member
 ├─ id
 ├─ type
 ├─ startNode
 ├─ endNode
 ├─ length
 ├─ sectionId
 ├─ materialId
 ├─ releases
 ├─ designRole
 ├─ grid/bay/span
 ├─ designActions
 ├─ utilization
 └─ quantity
```

### Section

``` text
Section
 ├─ id
 ├─ family
 ├─ geometry
 ├─ area
 ├─ Ix/Iy
 ├─ Zx/Zy
 ├─ rx/ry
 ├─ unitMass
 ├─ material
 └─ fabrication metadata
```

------------------------------------------------------------------------

## 4. Module Architecture

### 4.1 Input Module

Responsibilities:

-   capture project data;
-   validate ranges;
-   normalize units;
-   preserve raw user input;
-   expose assumptions.

Never perform final engineering calculations directly in UI event
handlers.

### 4.2 Design Basis Module

Stores:

-   standards;
-   standard editions;
-   load factors;
-   material grades;
-   serviceability limits;
-   wind parameters;
-   seismic parameters;
-   project-specific overrides.

The module must allow a project to retain the exact design-basis version
used for a calculation.

### 4.3 Geometry Engine

Generates:

-   X grid;
-   Z span grid;
-   Y levels;
-   frame lines;
-   roof geometry;
-   intermediate nodes;
-   end-wall framing;
-   openings;
-   crane support lines;
-   secondary member lines.

Unequal final bays and unequal width spans must remain supported.

### 4.4 Structural Model Builder

Converts geometry into an analytical graph:

``` text
Node ── Member ── Node
```

The graph must support:

-   member connectivity;
-   releases;
-   supports;
-   material;
-   section;
-   loads;
-   design groups.

### 4.5 Load Engine

Inputs:

-   geometry;
-   cladding;
-   occupancy;
-   location;
-   wind;
-   crane;
-   mezzanine;
-   canopy;
-   seismic.

Outputs:

``` text
LoadCase
LoadPattern
LoadEffect
Combination
```

### 4.6 Analysis/Design Engine

Two supported modes are recommended:

**A. Native/embedded preliminary solver**

Used for rapid screening and member iteration.

**B. STAAD-assisted mode**

Generate STAAD and optionally consume validated STAAD output.

The system must never claim that merely generating an `.STD` file is
equivalent to performing a structural analysis.

### 4.7 Member Selection Engine

For each design group:

1.  identify demand;
2.  select candidate sections;
3.  calculate/check capacity;
4.  check stability;
5.  check serviceability;
6.  reject failing sections;
7.  select the lightest acceptable section subject to
    fabrication/practical constraints;
8.  record the reason for selection.

### 4.8 Secondary Steel Engine

Calculates:

-   purlin spacing;
-   purlin spans;
-   girt spacing;
-   end-wall members;
-   eave struts;
-   ties/sag members.

### 4.9 Connection Engine

Preliminary module for:

-   rafter splice;
-   column splice;
-   rafter-column;
-   bracing;
-   purlin/girt;
-   crane bracket;
-   runway connection;
-   base plate;
-   anchor bolts.

The engine must distinguish preliminary connection sizing from final
connection design.

### 4.10 Quantity Engine

The only authoritative source for structural steel weight.

``` text
Member
 → Length
 → Section
 → Unit mass
 → Quantity
 → Gross weight
 → fabrication/connection allowances
```

Allowances must be explicit, not hidden in a benchmark multiplier.

### 4.11 STAAD Generator

Converts canonical model objects into valid STAAD syntax.

The generator must be version-aware and template-driven.

### 4.12 Validation Engine

Runs before export and after model generation.

Checks:

-   topology;
-   references;
-   units;
-   property completeness;
-   load references;
-   supports;
-   combinations;
-   member connectivity;
-   invalid geometry;
-   duplicate IDs;
-   orphan nodes;
-   orphan members.

### 4.13 Reporting Engine

Uses canonical model data to create:

-   PDF;
-   CSV;
-   Excel;
-   STAAD preview;
-   BOQ;
-   estimate;
-   design summary.

No report should independently recalculate structural quantities.

------------------------------------------------------------------------

## 5. Data Flow

``` text
User Input
  ↓
Normalized Input
  ↓
Design Basis Resolution
  ↓
Geometry
  ↓
Analytical Graph
  ↓
Load Cases
  ↓
Combinations
  ↓
Analysis
  ↓
Member Design
  ↓
Member Iteration
  ↓
Validated Final Preliminary Model
  ↓
┌───────────────┬──────────────┬───────────────┐
│ STAAD         │ Quantity     │ Reporting     │
│ Generator     │ Engine       │ Engine        │
└───────────────┴──────────────┴───────────────┘
```

------------------------------------------------------------------------

## 6. STAAD Output Architecture

The generator should use an intermediate representation rather than
assembling raw strings throughout the UI.

``` text
STAADDocument
 ├─ header
 ├─ jobInfo
 ├─ units
 ├─ joints[]
 ├─ members[]
 ├─ materials[]
 ├─ properties[]
 ├─ constants
 ├─ supports[]
 ├─ releases[]
 ├─ loadCases[]
 ├─ combinations[]
 ├─ analysisCommands[]
 └─ designCommands[]
```

Each object is validated before serialization.

------------------------------------------------------------------------

## 7. Reference File Strategy

The supplied `Design model 2.STD`, if provided to the implementation
environment, is a **syntax/structure reference**.

Use it to determine:

-   command ordering;
-   syntax style;
-   coordinate formatting;
-   member-incidence formatting;
-   material definition structure;
-   property structure;
-   support syntax;
-   load syntax;
-   load-combination syntax;
-   design command organization.

Never copy its project coordinates or numerical values into a new
project.

------------------------------------------------------------------------

## 8. Storage

Recommended project package:

``` text
project/
 ├─ project.json
 ├─ design-basis.json
 ├─ geometry.json
 ├─ structural-model.json
 ├─ loads.json
 ├─ member-design.json
 ├─ quantity.json
 ├─ validation.json
 ├─ staad/
 │   └─ <project>_PEB_STAAD_MODEL.STD
 └─ reports/
```

For Excel deployment, the workbook can act as the user-facing container
while maintaining a logically equivalent internal object model.

------------------------------------------------------------------------

## 9. Versioning

Version independently:

-   application;
-   project schema;
-   design-basis database;
-   section database;
-   STAAD serializer;
-   calculation engine.

A saved project must record all of these versions.

------------------------------------------------------------------------

## 10. Security and Integrity

-   Prevent malformed input from entering the engineering engine.
-   Never execute generated STAAD text.
-   Validate all exported references.
-   Maintain an immutable calculation snapshot for each export.
-   Record warnings and overrides.
-   Require explicit confirmation for engineering overrides.

------------------------------------------------------------------------

## 11. Current Prototype → Target Architecture

The supplied V11.9 HTML prototype is a useful UI/prototype baseline. It
already has a single authoritative calculation path for visible
estimates, CSV, project save and STAAD export, and it contains
preliminary crane logic.

However, the target architecture must replace benchmark-controlled
practical scaling with a member-driven engineering quantity pipeline.
The current code's benchmark path is therefore a migration concern, not
an architectural dependency.

------------------------------------------------------------------------

## 12. External Interfaces

### Input

-   Browser/Excel UI.
-   Project JSON.
-   Lookup databases.

### Output

-   STAAD `.STD`.
-   CSV.
-   PDF.
-   Excel/BOQ.
-   Project package.

### Optional

-   STAAD.Pro result import.
-   External section database.
-   ERP/procurement integration.
