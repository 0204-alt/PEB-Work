# PEB Software --- Professional Product Design Specification

## 1. Design Objective

The application must look and behave like a **professional structural
engineering and estimation system**, not a consumer SaaS dashboard or an
AI-generated showcase website.

The visual language should communicate:

-   engineering precision;
-   technical credibility;
-   restrained information density;
-   reliability;
-   traceability;
-   long-term desktop use;
-   familiarity with established engineering software.

The interface should feel appropriate for a structural designer working
on a real project for several hours, rather than a promotional product
demo.

------------------------------------------------------------------------

## 2. Core Visual Direction

### Design Character

Use a **technical drafting / engineering workstation aesthetic**.

The visual system should be:

-   restrained;
-   precise;
-   neutral;
-   highly legible;
-   grid-based;
-   information-oriented;
-   consistent.

Avoid visual patterns commonly associated with AI-generated or
"vibecoded" interfaces.

### Explicitly Avoid

Do not use:

-   large decorative gradients;
-   purple/blue AI-style gradients;
-   glowing cards;
-   excessive glassmorphism;
-   translucent floating panels;
-   neon borders;
-   excessive rounded corners;
-   oversized hero typography;
-   decorative blobs;
-   abstract background shapes;
-   excessive shadows;
-   animated cards;
-   unnecessary particle effects;
-   emoji-based UI;
-   excessive iconography;
-   marketing-style metric cards;
-   "AI" visual motifs;
-   excessive whitespace that wastes engineering screen area.

The application should not resemble a landing page.

------------------------------------------------------------------------

## 3. Recommended Visual Theme

### Theme: Engineering Drafting / Industrial Workstation

Use a restrained neutral palette with one functional accent.

Suggested base palette:

``` text
Application background     #E9E9E6
Panel background            #F5F5F2
Secondary panel             #DEDEDA
Border                      #B8B8B2
Primary text                #202020
Secondary text              #5E5E59
Muted text                  #777770
Primary accent              #315C72
Accent dark                 #244657
Warning                     #A56A00
Error                       #9A2E2E
Success                     #356B4B
Model background            #D8D9D5
Drawing/grid line           #A7AAA5
```

The accent should be used sparingly for:

-   active navigation;
-   selected members;
-   important controls;
-   links;
-   engineering status indicators.

Do not use the accent as a decorative gradient.

------------------------------------------------------------------------

## 4. Color Philosophy

Color must communicate meaning rather than decoration.

### Normal

Neutral backgrounds and dark text.

### Selected

A restrained blue/steel accent.

### Warning

Muted amber.

### Error

Muted engineering red.

### Validated

Muted green.

Do not use saturated colors across entire panels.

Do not make every card a different color.

------------------------------------------------------------------------

## 5. Typography

Use a professional technical type system.

Recommended:

-   **Inter** or **Source Sans 3** for interface text.
-   **IBM Plex Mono**, **JetBrains Mono**, or a system monospace font
    for:
    -   STAAD output;
    -   coordinates;
    -   member IDs;
    -   technical logs;
    -   calculation traces.

Avoid:

-   futuristic display fonts;
-   oversized geometric fonts;
-   decorative typography;
-   excessive font-weight variation.

### Type Hierarchy

``` text
Application title       18–22 px
Section heading         15–17 px
Panel heading           13–15 px
Body                    13 px
Table text              12–13 px
Technical data          12 px monospace
Helper text             11–12 px
```

The interface should remain compact.

------------------------------------------------------------------------

## 6. Application Shell

The application should use a traditional engineering workstation layout.

``` text
┌──────────────────────────────────────────────────────────────────┐
│ PROJECT | FILE | EDIT | VIEW | CALCULATE | EXPORT | HELP        │
├───────────────┬──────────────────────────────────┬───────────────┤
│               │                                  │               │
│ PROJECT TREE  │          MODEL / DRAWING         │ PROPERTIES    │
│               │                                  │               │
│ Project       │                                  │ Selection     │
│ Geometry      │                                  │ Properties    │
│ Loads         │                                  │ Design        │
│ Main Frame    │                                  │ Checks        │
│ Secondary     │                                  │               │
│ Bracing       │                                  │               │
│ Crane         │                                  │               │
│ Connections   │                                  │               │
│ STAAD         │                                  │               │
│ BOQ           │                                  │               │
│ Reports       │                                  │               │
├───────────────┴──────────────────────────────────┴───────────────┤
│ STATUS: VALID | UNITS: kN, m, kg | PROJECT: ABC_PEB             │
└──────────────────────────────────────────────────────────────────┘
```

The shell should feel closer to established CAD/structural engineering
applications than to a modern SaaS product.

------------------------------------------------------------------------

## 7. Top Menu

Use a restrained menu bar.

Recommended:

``` text
File
Edit
Project
Geometry
Loads
Design
Model
STAAD
Quantity
Reports
View
Help
```

Primary actions may appear in a compact toolbar below it:

``` text
New | Open | Save | Calculate | Validate | Generate STAAD | Export
```

Do not use large pill-shaped buttons.

------------------------------------------------------------------------

## 8. Project Navigation

Use a **tree or structured vertical navigation**, not a collection of
floating cards.

Example:

``` text
PROJECT
├── General
├── Geometry
├── Design Basis
├── Loads
├── Main Frame
├── Secondary Steel
├── Bracing
├── Crane
├── Mezzanine
├── Canopy
├── Openings
├── Connections
├── Base Plate
├── Analysis
├── Member Schedule
├── STAAD Model
├── Weight Summary
├── BOQ
├── Estimate
└── Reports
```

Each module should have a clear status indicator where necessary.

------------------------------------------------------------------------

## 9. Dashboard

The dashboard should be an **engineering project summary**, not a
marketing dashboard.

Show:

### Project Information

-   Project name
-   Client
-   Location
-   Building type
-   Calculation version
-   Design-basis version

### Geometry Summary

-   Length
-   Width
-   Eave height
-   Roof slope
-   Number of bays
-   Number of spans
-   Total floor area

### Structural Summary

-   Primary steel
-   Secondary steel
-   Bracing
-   Connection steel
-   Crane-support steel
-   Mezzanine steel
-   Canopy steel
-   Total structural steel

### Design Status

-   Geometry validation
-   Load validation
-   Analysis status
-   Member design status
-   STAAD validation
-   Quantity validation

Present these as compact information rows or tables.

Avoid oversized statistic cards.

------------------------------------------------------------------------

## 10. Project Input Interface

Inputs should resemble a professional engineering form.

Example:

``` text
BUILDING GEOMETRY
────────────────────────────────────────

Building Length        [ 80.00 ] m
Building Width         [ 30.00 ] m
Eave Height            [  9.50 ] m
Roof Slope             [ 1:10  ]

Bay Configuration
Bay Spacing            [ 6.00 ] m
Number of Bays         [ 14 ]

Width Spans
Span 1                 [ 15.00 ] m
Span 2                 [ 15.00 ] m
```

Use:

-   aligned labels;
-   units beside fields;
-   clear input borders;
-   numeric formatting;
-   validation messages below fields.

Do not use giant rounded input boxes.

------------------------------------------------------------------------

## 11. Geometry / Model Viewer

The model viewer is a primary engineering workspace.

### Views

Provide:

-   3D;
-   plan;
-   front elevation;
-   side elevation;
-   section;
-   isometric.

### Display Controls

``` text
Nodes
Members
Primary
Secondary
Bracing
Crane
Dimensions
Grid
Loads
Labels
```

Use technical linework rather than cinematic rendering.

------------------------------------------------------------------------

## 12. Model Visual Style

The structural model should resemble an engineering drawing.

### Primary Members

Use a strong but restrained line weight.

### Secondary Members

Use thinner line weight.

### Bracing

Use distinct but non-saturated linework.

### Grid

Use light technical construction lines.

### Selected Member

Use the single accent color.

### Loads

Use conventional engineering arrows and labels.

Avoid:

-   glowing members;
-   animated trails;
-   neon objects;
-   photorealistic materials;
-   unnecessary shadows;
-   decorative 3D environments.

The model should communicate structure, not visual spectacle.

------------------------------------------------------------------------

## 13. Drawing Style

Provide an optional technical drawing mode.

Recommended:

-   light neutral drawing background;
-   thin black/gray linework;
-   dimensions;
-   grid bubbles;
-   member IDs;
-   elevation labels;
-   section markers;
-   title block.

The drawing view should feel closer to a structural drawing sheet than a
game engine viewport.

------------------------------------------------------------------------

## 14. Properties Panel

Selecting an object should expose its engineering information.

Example:

``` text
MEMBER M1042
──────────────────────────────
Type             RAFTER
Frame            F08
Bay              08
Start Node       N083
End Node         N091

SECTION
Type             Built-Up I
Depth            820 mm
Web              8 mm
Flange           250 × 16 mm
Material         E350
Unit Mass        78.4 kg/m

DESIGN
Axial            142.3 kN
Moment           386.1 kNm
Shear            94.2 kN
Utilization      0.82
Governing Case   ULS-WIND+Z

STATUS
PASS
```

The panel should be data-dense and easy to inspect.

------------------------------------------------------------------------

## 15. Member Design Screen

The design screen should show the engineering decision trail.

``` text
DESIGN GROUP: MAIN RAFTERS

Governing Demand
────────────────────────────────
Axial       142.3 kN
Moment      386.1 kNm
Shear        94.2 kN

Candidate Sections
────────────────────────────────
Section       Mass       Util.      Status
BU-650        64.2       1.18       FAIL
BU-720        70.8       1.03       FAIL
BU-780        75.1       0.91       PASS
BU-820        78.4       0.82       PASS

Selected: BU-780
Reason: Lightest acceptable candidate
```

This is more important than visual decoration.

------------------------------------------------------------------------

## 16. Validation Interface

Validation should be visible throughout the application.

Use a compact status bar and dedicated validation panel.

Example:

``` text
MODEL VALIDATION
────────────────────────────────────────

PASS   1,284 nodes validated
PASS   1,912 members validated
PASS   All members have properties
PASS   All members have materials
PASS   Supports defined

WARNING
      Crane supplier wheel data not provided.

ERROR
      Member M1842 references missing node N991.
      Export blocked.
```

Errors should be actionable.

Clicking an error should:

1.  focus the relevant object;
2.  show its properties;
3.  explain the problem;
4.  identify the corrective input.

------------------------------------------------------------------------

## 17. STAAD Interface

The STAAD screen should look like a technical file/editor.

Use:

-   monospaced text;
-   line numbers;
-   restrained syntax highlighting;
-   section navigation;
-   validation markers.

Example sections:

``` text
JOB INFORMATION
UNITS
JOINT COORDINATES
MEMBER INCIDENCES
DEFINE MATERIAL
MEMBER PROPERTY
CONSTANTS
SUPPORTS
MEMBER RELEASE
LOAD
LOAD COMBINATION
PERFORM ANALYSIS
PARAMETER
CHECK CODE
FINISH
```

Primary actions:

``` text
Validate
Generate
Preview
Export .STD
```

No decorative terminal effects.

------------------------------------------------------------------------

## 18. Member Schedule

Use a dense engineering table.

  ------------------------------------------------------------------------------------
  ID     Type     Grid   Bay      Length Section       kg/m      Qty Total kg    Util.
  ------ -------- ------ ------ -------- --------- -------- -------- -------- --------
  M101   Column   F01    01         9.50 BU-720        72.4        2   1375.6     0.74

  M102   Rafter   F01    01        15.30 BU-650        65.1        2   1992.1     0.81
  ------------------------------------------------------------------------------------

Features:

-   sorting;
-   filtering;
-   grouping;
-   export;
-   select member from row;
-   highlight selected member in model.

------------------------------------------------------------------------

## 19. Weight Summary

Use a structured quantity table.

``` text
STRUCTURAL STEEL WEIGHT
─────────────────────────────────────────────

Primary Steel
  Columns                         182.4 MT
  Rafters                         214.8 MT
  End Wall Primary                 18.7 MT

Secondary Steel
  Purlins                          76.2 MT
  Girts                            61.4 MT
  Eave Struts                       8.1 MT

Bracing                            21.6 MT
Connections                        14.2 MT
Crane Support Steel                32.5 MT
Mezzanine                          18.4 MT

─────────────────────────────────────────────
TOTAL                             648.3 MT
Derived Steel Intensity            30.87 kg/m²
```

The derived kg/m² value is useful as a diagnostic metric but must never
drive the quantity calculation.

------------------------------------------------------------------------

## 20. BOQ Interface

BOQ should use a conventional commercial/engineering table.

  Item   Description        Unit     Quantity   Rate   Amount
  ------ ------------------ ------ ---------- ------ --------
  1      Built-up columns   MT          182.4    ---      ---
  2      Built-up rafters   MT          214.8    ---      ---
  3      Purlins            MT           76.2    ---      ---
  4      Girts              MT           61.4    ---      ---

Include:

-   item code;
-   description;
-   specification;
-   unit;
-   quantity;
-   rate;
-   amount;
-   source.

------------------------------------------------------------------------

## 21. Estimate Interface

The estimate should resemble professional quantity-surveying software.

Separate:

-   material;
-   fabrication;
-   surface treatment;
-   erection;
-   transport;
-   cladding;
-   accessories;
-   other project costs.

Do not hide engineering allowances inside material quantities.

------------------------------------------------------------------------

## 22. Design Basis Interface

The design basis should be a formal technical record.

``` text
DESIGN BASIS
────────────────────────────────────────

Steel Design
IS 800
Edition: [Project Selected Edition]

Dead Loads
IS 875 Part 1
Edition: [Project Selected Edition]

Imposed Loads
IS 875 Part 2
Edition: [Project Selected Edition]

Wind
IS 875 Part 3
Edition: [Project Selected Edition]

Seismic
IS 1893
Status: Applicable / Not Applicable

Additional Requirements
NBC / Local Authority / Project Specification
```

Include:

-   source;
-   edition;
-   applicability;
-   assumptions;
-   project overrides.

------------------------------------------------------------------------

## 23. Reports

Reports should resemble engineering calculation documents.

Recommended structure:

1.  Cover sheet
2.  Project information
3.  Design basis
4.  Geometry
5.  Material specification
6.  Load summary
7.  Structural system
8.  Primary member design
9.  Secondary steel
10. Bracing
11. Crane
12. Connections
13. Base plates
14. Member schedule
15. Weight summary
16. BOQ
17. Estimate
18. Validation
19. STAAD model summary
20. Assumptions
21. Engineering disclaimer

Use:

-   page numbers;
-   revision;
-   project number;
-   calculation date;
-   prepared/checked fields;
-   consistent title blocks.

------------------------------------------------------------------------

## 24. Excel Workbook Design

If the final deployment remains `.xlsm`, the workbook should follow a
professional engineering workbook structure.

Recommended sheets:

``` text
01_PROJECT_INPUT
02_DESIGN_BASIS
03_BUILDING_GEOMETRY
04_WIND_DATA
05_DESIGN_LOADS
06_MAIN_FRAME
07_SECONDARY_STEEL
08_BRACING
09_CRANE
10_MEZZANINE
11_CANOPY
12_OPENINGS
13_CONNECTIONS
14_BASE_PLATE
15_MEMBER_SCHEDULE
16_JOINT_SCHEDULE
17_STAAD_OUTPUT
18_VALIDATION
19_WEIGHT_SUMMARY
20_BOQ
21_ESTIMATE
22_DASHBOARD
23_LOOKUP_DATA
24_ASSUMPTIONS
25_AUDIT_LOG
```

Use conventional spreadsheet styling:

-   clear sheet titles;
-   frozen headers;
-   consistent units;
-   restrained colors;
-   visible formulas where appropriate;
-   protected calculation cells where appropriate;
-   clear input/output distinction.

Avoid turning the workbook into a colorful dashboard.

------------------------------------------------------------------------

## 25. Design Tokens

### Border Radius

Keep low:

``` text
2–4 px
```

Do not use large pill shapes.

### Shadows

Use minimal or no shadow.

Panels should be separated primarily by:

-   borders;
-   spacing;
-   background tone;
-   hierarchy.

### Borders

Use thin technical borders.

### Spacing

Use compact 8 px / 12 px / 16 px spacing increments.

The interface should maximize useful engineering information per screen.

------------------------------------------------------------------------

## 26. Animation

Animation should be minimal.

Allowed:

-   subtle panel transitions;
-   model camera transitions;
-   loading indicators;
-   selection feedback.

Avoid:

-   animated gradients;
-   floating objects;
-   scroll-driven visual effects;
-   particle backgrounds;
-   card entrance animations;
-   exaggerated hover effects.

Engineering software should feel stable.

------------------------------------------------------------------------

## 27. Icons

Use icons only where they improve navigation or recognition.

Preferred:

-   simple line icons;
-   familiar file/edit/view symbols;
-   engineering symbols where appropriate.

Never use emojis as interface controls or status indicators.

------------------------------------------------------------------------

## 28. Responsive Strategy

This is primarily a desktop engineering application.

Priority:

1.  1920×1080
2.  1600×900
3.  1440×900
4.  1280×720

At smaller widths:

-   collapse the project tree;
-   collapse the properties panel;
-   preserve the model viewport;
-   retain access to validation;
-   allow horizontal table scrolling.

Do not redesign the application into a mobile-first SaaS interface.

------------------------------------------------------------------------

## 29. Professional Interaction Model

### Input → Calculate

The user explicitly controls calculation runs.

### Calculate → Validate

The system reports model status.

### Validate → Generate

STAAD generation becomes available when critical errors are resolved.

### Generate → Review

The user can inspect the generated model.

### Review → Export

Exports use the exact validated calculation snapshot.

This creates a clear engineering workflow rather than an opaque "magic
calculate" button.

------------------------------------------------------------------------

## 30. Visual Quality Standard

A successful design should make the user think:

> "This looks like engineering software."

It should not make the user think:

> "This looks like an AI-generated SaaS landing page."

The design should prioritize:

**precision over decoration, information over spectacle, consistency
over novelty, and engineering traceability over visual effects.**

------------------------------------------------------------------------

## 31. Existing V11.9 Migration

The current V11.9 interface can remain the functional baseline, but its
presentation should be progressively moved toward this engineering
workstation model.

Preserve useful functionality:

-   dashboard;
-   building inputs;
-   wind/location;
-   loads;
-   main-frame controls;
-   secondary steel;
-   bracing;
-   crane;
-   model views;
-   estimate;
-   BOQ;
-   reports;
-   project save/open;
-   STAAD export.

Change the visual language:

-   remove decorative gradients;
-   remove unnecessary glass effects;
-   remove oversized dashboard cards;
-   remove decorative animation;
-   remove emoji/icon-heavy UI;
-   use technical tables and forms;
-   introduce project-tree navigation;
-   introduce engineering-style status indicators;
-   make the model viewer the primary workspace;
-   make calculation provenance visible.

Most importantly, visual changes must not obscure the engineering
calculation path.

------------------------------------------------------------------------

## 32. Final Design Principle

The product should visually communicate the same philosophy as its
engineering architecture:

``` text
Measured Input
      ↓
Defined Geometry
      ↓
Structural Model
      ↓
Engineering Calculation
      ↓
Validated Result
      ↓
Traceable Quantity
      ↓
Professional Output
```

Every part of the interface should reinforce this chain.
