# PEB Project Implementation Phases

## Phase 0 --- Baseline & Evidence

### Objective

Freeze the current baseline before changing engineering logic.

### Tasks

-   Review `Original user requirements.txt`.
-   Review current `index.html`.
-   Review current `README.txt`.
-   Obtain and inspect `Design model 2.STD` if it is part of the
    implementation package.
-   Record current UI modules.
-   Record current calculation pipeline.
-   Record current export behavior.
-   Identify benchmark-driven logic.
-   Identify existing tests.

### Exit Criteria

-   Baseline documented.
-   Reference STAAD syntax source available.
-   Current prototype can be run.
-   Known limitations documented.

------------------------------------------------------------------------

## Phase 1 --- Domain Model

### Objective

Create the canonical project/geometry/structural model.

### Build

-   Project object.
-   Design-basis object.
-   Grid object.
-   Node object.
-   Member object.
-   Section object.
-   Material object.
-   Load case object.
-   Combination object.
-   Validation object.

### Exit Criteria

A project can be serialized/deserialized without losing structural
information.

------------------------------------------------------------------------

## Phase 2 --- Geometry Engine

### Objective

Generate deterministic PEB geometry.

### Build

-   longitudinal grid;
-   transverse spans;
-   eave;
-   ridge;
-   multi-span roofs;
-   unequal bays;
-   end walls;
-   openings;
-   crane support levels;
-   purlin/girt lines;
-   bracing nodes;
-   mezzanine;
-   canopy.

### Tests

-   divisible length;
-   non-divisible length;
-   unequal spans;
-   single span;
-   multi-span;
-   invalid dimensions.

### Exit Criteria

No duplicate nodes and complete frame connectivity.

------------------------------------------------------------------------

## Phase 3 --- Section & Material Database

### Objective

Build a versioned engineering database.

### Include

-   standard rolled sections;
-   built-up section definitions;
-   tapered-section parameters;
-   cold-formed sections where supported;
-   steel grades;
-   density;
-   elastic properties;
-   section properties;
-   unit mass.

### Exit Criteria

Any selected member can produce a deterministic section-property record.

------------------------------------------------------------------------

## Phase 4 --- Load Engine

### Objective

Replace simplistic load assumptions with an explicit design-basis-driven
load system.

### Build

-   dead load;
-   imposed load;
-   collateral load;
-   wind;
-   uplift;
-   crane;
-   mezzanine;
-   canopy;
-   seismic where applicable;
-   special loads.

### Exit Criteria

Every generated load has a source, case, unit and design-basis
reference.

------------------------------------------------------------------------

## Phase 5 --- Primary Frame Design

### Objective

Design preliminary columns and rafters from actual demand.

### Build

-   candidate section generation;
-   built-up section sizing;
-   tapered member geometry;
-   axial/bending/shear checks;
-   slenderness;
-   stability checks;
-   serviceability checks;
-   iteration.

### Exit Criteria

The engine can explain why a member was selected and why alternatives
failed.

------------------------------------------------------------------------

## Phase 6 --- Secondary Steel

### Build

-   purlins;
-   girts;
-   eave struts;
-   sag rods/ties;
-   end-wall secondary framing.

### Exit Criteria

Secondary steel exists in both structural model and quantity model.

------------------------------------------------------------------------

## Phase 7 --- Bracing

### Build

-   roof bracing;
-   wall bracing;
-   X;
-   diagonal;
-   chevron;
-   rod/pipe/angle options.

### Exit Criteria

Selected bracing is geometrically connected and included in STAAD and
BOQ.

------------------------------------------------------------------------

## Phase 8 --- Crane System

### Build

-   crane input;
-   supplier/preliminary assumptions;
-   wheel loads;
-   impact;
-   longitudinal force;
-   transverse force;
-   supporting columns;
-   runway/crane support members;
-   crane load cases.

### Exit Criteria

Crane ON/OFF behavior is isolated and tested.

------------------------------------------------------------------------

## Phase 9 --- Connections & Base Plates

### Build

-   preliminary rafter splice;
-   column splice;
-   rafter-column;
-   crane bracket;
-   bracing;
-   purlin/girt;
-   base plate;
-   anchor bolts.

### Exit Criteria

Connection quantities follow the generated structural model.

------------------------------------------------------------------------

## Phase 10 --- Analysis Integration

### Build

-   internal preliminary solver OR validated external solver
    integration;
-   analysis result model;
-   member demand import;
-   utilization tracking;
-   iteration loop.

### Critical Rule

Do not label a generated model as "analysed" until actual analysis has
occurred.

------------------------------------------------------------------------

## Phase 11 --- STAAD Generator

### Build

-   serializer;
-   command templates;
-   unit system;
-   nodes;
-   members;
-   properties;
-   materials;
-   supports;
-   releases;
-   loads;
-   combinations;
-   analysis/design commands.

### Exit Criteria

Generated `.STD` is syntactically valid for the targeted STAAD.Pro
version.

------------------------------------------------------------------------

## Phase 12 --- Validation Engine

### Build

-   geometry validator;
-   connectivity validator;
-   property validator;
-   material validator;
-   load validator;
-   combination validator;
-   syntax validator;
-   unit validator.

### Exit Criteria

Critical errors block export.

------------------------------------------------------------------------

## Phase 13 --- Quantity & BOQ

### Build

-   member weight;
-   plate weight;
-   bolt weight;
-   primary steel;
-   secondary steel;
-   bracing;
-   crane-support steel;
-   mezzanine;
-   canopy;
-   connection steel.

### Exit Criteria

No quantity is generated from benchmark scaling.

------------------------------------------------------------------------

## Phase 14 --- Estimation

### Build

-   material rates;
-   fabrication;
-   coating;
-   erection;
-   transport;
-   cladding;
-   accessories;
-   GST;
-   subtotal;
-   grand total.

### Exit Criteria

Estimate can trace each quantity back to a source component.

------------------------------------------------------------------------

## Phase 15 --- UI Migration

### Preserve

The current V11.9 interface concept:

-   dashboard;
-   building;
-   main frame;
-   secondary;
-   bracing;
-   crane;
-   mezzanine;
-   canopy;
-   openings;
-   plates/connections;
-   base plate;
-   estimate;
-   BOQ;
-   drawing;
-   report;
-   settings.

### Change

Remove or isolate benchmark-driven engineering behavior.

------------------------------------------------------------------------

## Phase 16 --- Regression Testing

### Test Categories

-   geometry;
-   load generation;
-   member selection;
-   crane;
-   quantity;
-   STAAD export;
-   save/open;
-   CSV;
-   PDF;
-   UI;
-   validation.

### Required Regression

Current V11.9 verification notes include tests for duplicate calculation
functions, crane-on rendering, frame rendering, unified
calculation/export, saved span inputs and benchmark arithmetic. Preserve
relevant tests while replacing obsolete benchmark behavior.

------------------------------------------------------------------------

## Phase 17 --- Professional Validation

### Required

-   representative single-span building;
-   multi-span building;
-   unequal bays;
-   crane building;
-   wind-sensitive building;
-   braced building;
-   mezzanine;
-   canopy;
-   large industrial building.

Compare:

-   geometry;
-   load cases;
-   member sizes;
-   utilization;
-   steel weight;
-   STAAD model;
-   BOQ.

------------------------------------------------------------------------

## Phase 18 --- Release Candidate

### Release Requirements

-   all critical tests pass;
-   engineering assumptions documented;
-   design-basis versions locked;
-   export validation works;
-   no benchmark scaling;
-   professional disclaimer visible;
-   user documentation complete;
-   known limitations documented.

------------------------------------------------------------------------

## Phase 19 --- Future Enhancements

Potential future modules:

-   foundation design;
-   detailed connection design;
-   advanced crane runway analysis;
-   automatic drawing generation;
-   fabrication nesting;
-   CNC/BOM export;
-   ERP integration;
-   multi-project database;
-   cloud collaboration;
-   STAAD result import;
-   advanced optimization;
-   sensitivity analysis.
