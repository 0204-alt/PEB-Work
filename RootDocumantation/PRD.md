# PEB Design, Analysis, Estimation & STAAD Model Generator --- PRD

## 1. Product Definition

A professional preliminary Pre-Engineered Building (PEB) design,
structural modelling, quantity estimation and STAAD.Pro model-generation
system.

The system converts project inputs into:

**Inputs → Geometry → Structural Model → Loads → Analysis/Member Design
→ Section Selection → STAAD Model → Member Schedule → Steel Quantity →
BOQ → Estimate → Reports**

The core requirement is that steel quantity is derived from the
generated structural system and member data, not from a fixed kg/m²
multiplier.

> **Engineering status:** This is an automated preliminary design and
> estimation system. Generated member sizes, connections, loads, STAAD
> models and quantities require review and approval by a qualified
> structural engineer before construction or issue-for-construction use.

------------------------------------------------------------------------

## 2. Source Baseline

The project has three supplied baseline artifacts:

1.  `Original user requirements.txt` --- original Excel/STAAD generator
    requirements.
2.  `index.html` --- current V11.9 browser prototype and its existing
    UI/calculation pipeline.
3.  `README.txt` --- current V11.9 implementation notes and verification
    history.

The original requirement explicitly requires a real text-based `.STD`
file containing actual STAAD geometry and structural commands, and
requires the generated model to be auditable and testable in STAAD.Pro.

The current V11.9 prototype already contains a unified calculation
pipeline, 3D/2D views, wind-location data, crane logic, member
selection, estimates, CSV/PDF/project save/export and a preliminary
design-basis/disclaimer. However, its current practical-estimate path
still contains benchmark-based scaling. The updated client requirement
supersedes that behavior for the target product.

------------------------------------------------------------------------

## 3. Problem

Conventional preliminary PEB estimation often begins with a broad kg/m²
assumption. That is useful as a sanity check but insufficient as the
primary engineering calculation.

The target system must account for:

-   building geometry;
-   frame spacing;
-   roof slope;
-   span configuration;
-   primary member demand;
-   tapered/built-up member geometry;
-   secondary steel;
-   purlins;
-   girts;
-   bracing;
-   openings and end-wall framing;
-   crane effects;
-   mezzanine/canopy effects;
-   design loads;
-   wind;
-   seismic where applicable;
-   serviceability;
-   member stability;
-   connections and plates;
-   base plates and anchor bolts;
-   actual section lengths and unit weights.

------------------------------------------------------------------------

## 4. Goals

### 4.1 Primary Goals

-   Generate a geometry-driven PEB structural model.
-   Calculate preliminary structural demands from applicable design
    loads.
-   Select/check structural members using an explicit design algorithm.
-   Calculate steel quantities from actual generated members.
-   Generate a real STAAD.Pro `.STD` model.
-   Keep the estimation model and STAAD model based on the same
    source-of-truth structural model.
-   Provide transparent engineering assumptions and calculation traces.
-   Support professional auditability.
-   Produce BOQ, weight summary, estimate and reports.

### 4.2 Secondary Goals

-   Support multiple building spans.
-   Support unequal bay spacing where required.
-   Support tapered and straight primary members.
-   Support crane buildings.
-   Support roof/wall bracing patterns.
-   Support mezzanine and canopy systems.
-   Provide 3D, plan, front and side model views.
-   Provide project save/open functionality.
-   Provide validation before export.

### 4.3 Non-Goals

The initial release is not intended to:

-   replace a qualified structural engineer;
-   certify a structure for construction;
-   perform foundation design without adequate geotechnical/design
    inputs;
-   guarantee a final STAAD.Pro analysis result without running
    STAAD.Pro or an equivalent validated solver;
-   treat a kg/m² benchmark as the structural design engine.

------------------------------------------------------------------------

## 5. Target Users

### Primary

-   PEB structural designers.
-   Structural design engineers.
-   PEB estimation engineers.
-   Design/detailing teams.
-   Engineering consultants.

### Secondary

-   Project managers.
-   Quantity surveyors.
-   Fabrication/procurement teams.
-   Students/researchers using the system for preliminary modelling.

------------------------------------------------------------------------

## 6. User Workflow

1.  Create project.
2.  Enter project metadata.
3.  Select building type.
4.  Enter length, width, eave height and roof geometry.
5.  Define bay and span configuration.
6.  Configure openings/end walls.
7.  Configure primary frame type.
8.  Configure purlins and girts.
9.  Configure roof and wall bracing.
10. Configure crane, if applicable.
11. Configure mezzanine/canopy, if applicable.
12. Enter cladding and collateral loads.
13. Select location/design basis.
14. Generate code-based load cases.
15. Generate building geometry.
16. Generate analytical nodes and members.
17. Generate member properties.
18. Analyse/design or perform validated preliminary member screening.
19. Iterate member sizes until design constraints are satisfied.
20. Generate connections/base plates/anchor requirements at the
    supported preliminary level.
21. Validate connectivity and model integrity.
22. Generate STAAD `.STD`.
23. Generate member schedule.
24. Calculate steel weight from actual member quantities.
25. Generate BOQ and estimate.
26. Generate reports and audit trail.
27. Export project.

------------------------------------------------------------------------

## 7. Functional Requirements

### FR-01 Project Input

Inputs shall include, as applicable:

-   Project name
-   Client
-   Location
-   Building type
-   Building length
-   Building width
-   Eave height
-   Roof slope
-   Bay spacing
-   Number of bays
-   Number of width spans
-   Individual span widths
-   Column type
-   Rafter type
-   Material grade
-   Crane ON/OFF
-   Crane type
-   Crane capacity
-   Crane span
-   Crane bay/range
-   Crane rail level
-   Roof bracing
-   Wall bracing
-   Mezzanine
-   Canopy
-   Roof cladding
-   Wall cladding
-   Openings
-   Dead/collateral loads
-   Imposed loads
-   Site/wind inputs
-   Seismic inputs where applicable
-   Design/serviceability criteria.

### FR-02 Geometry Engine

The geometry engine shall create:

-   longitudinal grid;
-   transverse span grid;
-   frame lines;
-   column bases;
-   eaves;
-   ridge/intermediate roof points;
-   rafters;
-   end-wall framing;
-   crane-support nodes;
-   purlin lines;
-   girt lines;
-   bracing nodes;
-   mezzanine nodes;
-   canopy nodes.

If length does not divide evenly by bay spacing, the final bay shall be
calculated rather than silently forcing an incorrect equal grid.

### FR-03 Structural Model

Every generated member shall have:

-   unique ID;
-   member type;
-   start node;
-   end node;
-   length;
-   section/property;
-   material;
-   design role;
-   grid/bay/span metadata.

### FR-04 Primary Member Design

Support:

-   straight I sections;
-   built-up I sections;
-   tapered columns;
-   tapered rafters;
-   haunch regions where configured.

For built-up/tapered members, calculate actual:

-   depth;
-   flange width;
-   flange thickness;
-   web thickness;
-   taper;
-   length;
-   unit mass;
-   section properties.

### FR-05 Secondary Steel

Calculate and model:

-   roof purlins;
-   wall girts;
-   sag rods/tie members where applicable;
-   eave struts;
-   end-wall secondary members.

### FR-06 Bracing

Support:

-   rod;
-   pipe;
-   angle;
-   X-bracing;
-   single diagonal;
-   chevron;
-   configurable braced bays/grid lines.

Bracing shall be represented as actual analytical members, not merely
estimate line items.

### FR-07 Crane

Where enabled, support preliminary:

-   crane capacity;
-   crane self-weight;
-   trolley/hoist weight;
-   wheel arrangement;
-   impact;
-   transverse force;
-   longitudinal force;
-   runway/crane-supporting structure;
-   crane load cases.

Supplier data shall override preliminary assumptions.

### FR-08 Loads

Generate applicable:

-   self-weight/dead load;
-   roof imposed/live load;
-   collateral load;
-   wind pressure and effects;
-   wind uplift;
-   crane actions;
-   mezzanine load;
-   canopy load;
-   seismic actions where enabled;
-   other project-specific actions supported by the design basis.

### FR-09 Standards

The design-basis framework shall explicitly identify the applicable
edition and status of standards.

Core standards include:

-   IS 800 --- General Construction in Steel.
-   IS 875 Part 1 --- Dead loads.
-   IS 875 Part 2 --- Imposed loads.
-   IS 875 Part 3 --- Wind loads.
-   IS 875 Part 4 --- Snow loads where applicable.
-   IS 875 Part 5 --- Special loads/load combinations where applicable.
-   IS 1893 --- Seismic design where applicable.
-   NBC 2016 and applicable local/statutory requirements.
-   Other standards required by the selected system, material, crane or
    connection design.

The software must not hard-code an obsolete edition without a versioned
design-basis record.

### FR-10 Load Combinations

Generate combinations from the selected design basis.

Do not hard-code a single combination.

Each combination shall have:

-   combination ID;
-   description;
-   source load cases;
-   factors;
-   limit-state/serviceability category;
-   code/design-basis reference.

### FR-11 STAAD Generation

Generate a real `.STD` text file containing, as applicable:

-   `START JOB INFORMATION`;
-   `END JOB INFORMATION`;
-   unit declarations;
-   joint coordinates;
-   member incidences;
-   material definitions;
-   member properties;
-   constants;
-   supports;
-   releases;
-   load definitions;
-   self-weight;
-   member/joint loads;
-   load combinations;
-   analysis commands;
-   design parameters;
-   code checks;
-   `FINISH`.

The reference STAAD file, when supplied, shall be used for syntax and
organizational compatibility, not copied numerically.

### FR-12 Validation

Before export:

-   no duplicate joints;
-   no missing joint references;
-   no disconnected critical members;
-   columns connect to bases;
-   rafters connect to columns/ridge;
-   bracing connects to valid nodes;
-   purlins/girts connect correctly;
-   crane members connect correctly;
-   all members have properties;
-   all members have material;
-   supports exist;
-   loads reference valid entities;
-   load combinations reference valid load cases;
-   units are internally consistent;
-   generated STAAD syntax passes the software's parser/validator;
-   critical errors block export.

### FR-13 Quantity Engine

Steel quantity shall be calculated from the actual structural model:

`Member → Section → Length → Quantity → Unit Weight → Total Weight`

The system shall separately report:

-   primary steel;
-   secondary steel;
-   bracing;
-   connection steel;
-   base plates;
-   anchor bolts;
-   crane-supporting structural steel;
-   mezzanine steel;
-   canopy steel;
-   other applicable steel.

Cladding and non-steel scope items shall be separated from structural
steel.

### FR-14 Estimate

Calculate, as configured:

-   material cost;
-   fabrication;
-   painting/coating;
-   erection;
-   transportation;
-   cladding;
-   accessories;
-   crane system;
-   GST;
-   subtotal;
-   grand total.

### FR-15 Reports

Generate:

-   project summary;
-   design basis;
-   geometry;
-   load summary;
-   member schedule;
-   weight summary;
-   BOQ;
-   estimate;
-   connection/base-plate schedule;
-   STAAD output preview;
-   validation report;
-   assumptions and warnings.

------------------------------------------------------------------------

## 8. Quantity Accuracy Requirement

The target product shall not use fixed kg/m² as the primary calculation.

A benchmark may remain available only as:

-   sanity check;
-   historical comparison;
-   optional commercial calibration;
-   warning threshold.

A benchmark must never silently scale member quantities to force the
total to a target.

The current V11.9 implementation contains a practical mode that scales
displayed components to a benchmark total; this is explicitly a legacy
behavior to be removed or isolated from the engineering-derived
production path.

------------------------------------------------------------------------

## 9. Architecture-Level Data Flow

``` text
PROJECT INPUT
    ↓
DESIGN BASIS
    ↓
GEOMETRY ENGINE
    ↓
STRUCTURAL MODEL
    ↓
LOAD GENERATOR
    ↓
ANALYSIS / DESIGN ENGINE
    ↓
MEMBER SELECTION / ITERATION
    ↓
CONNECTION / BASE PLATE PRELIMINARY DESIGN
    ↓
VALIDATED MODEL
    ├──→ STAAD .STD GENERATOR
    ├──→ MEMBER SCHEDULE
    ├──→ WEIGHT ENGINE
    ├──→ BOQ
    └──→ ESTIMATE / REPORTS
```

------------------------------------------------------------------------

## 10. Acceptance Criteria

The product is acceptable only when:

1.  A complete project can be created from user inputs.
2.  Geometry is deterministic and auditable.
3.  Actual member geometry drives quantity.
4.  Changing a structural parameter changes affected geometry/member
    quantities.
5.  Changing a load changes member demand/selection where applicable.
6.  Crane load affects only intended supporting structure.
7.  No benchmark silently controls engineering-derived weight.
8.  Every reported steel weight can be traced to
    members/plates/components.
9.  STAAD output contains actual geometry and commands.
10. Critical validation errors prevent export.
11. The generated model can be independently reviewed.
12. Applicable Indian design standards are recorded with version/date.
13. The system clearly labels preliminary design status.

------------------------------------------------------------------------

## 11. Existing V11.9 Compatibility

Preserve useful current capabilities where they do not conflict with the
updated engineering requirement:

-   current dashboard/navigation;
-   3D/2D model views;
-   project save/open;
-   CSV/PDF export;
-   wind-location selector;
-   crane-on/off behavior;
-   member schedule/weight views;
-   design-basis/disclaimer.

The existing implementation has verified unified calculation/export
paths and crane-specific logic, but those behaviors do not by themselves
establish professional structural-design validity.

------------------------------------------------------------------------

## 12. Deliverables

Primary target:

`PEB_DESIGN_ESTIMATION_STAAD_GENERATOR.xlsm`

Recommended engineering implementation may use a modular application
backend rather than putting the entire engineering engine into Excel,
provided the required Excel workflow/export interface is preserved.

Supporting deliverables:

-   source code;
-   design-basis database;
-   section database;
-   calculation audit logs;
-   test suite;
-   generated STAAD examples;
-   user documentation;
-   validation documentation.
