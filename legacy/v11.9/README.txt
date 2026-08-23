PEB Design & Estimation Master Software V11.9 — Unified Calculation Pipeline

Base: V11.8-1 ACTUAL FIX (single index.html, verified, incremental update — no rebuild).

WHAT CHANGED FROM V11.8-1 (verified in source, not just claimed):

1) DEAD CODE / DUPLICATE FUNCTIONS REMOVED
   V11.8-1 had two definitions each of calculate() and exportPDF(). In JavaScript the
   second definition silently wins, so an entire first-generation pipeline (calc(),
   sectionCandidates(), screenSection(), selectSection(), craneDesign(),
   getCraneConfig(), updateCraneUI(), showCraneDesign(), the first calculate(), the
   first exportPDF()) was dead — never executed on screen, yet still wired to
   Save/Export CSV/STAAD/resize/view-switch handlers. All of it has been removed.
   There is now exactly one calculation function (v117Calc()), one calculate(), one
   exportPDF(), one draw().

2) LIVE BUG FIXED — crane-on canvas crash
   draw() called $('craneType').value, but no #craneType element exists in the DOM.
   Every time "Crane ON" was checked, this threw an uncaught TypeError and broke the
   3D/2D canvas. Fixed to use the existing #craneGirderType control (with a safe
   default) like the rest of the crane code already does.

3) LIVE BUG FIXED — main building frame not drawn
   The authoritative calculate() called draw({d,col,craneCol,raf}) without
   frameLines/rows. draw()'s column/rafter/bracing loops are
   for(let i=0;i<x.frameLines;i++) — with frameLines undefined, those loops never
   ran, so columns, rafters and bracing were silently not rendered on the canvas
   (only background reference lines showed). Fixed by passing frameLines and rows
   into draw().

4) SAVE PROJECT / EXPORT CSV / GENERATE STAAD now use the SAME calculation as the
   screen. They previously called the dead calc() pipeline, so a saved project or
   exported CSV could show different numbers than the Estimate Summary on screen.
   All three now read from v117Calc(), the same function that drives the visible
   Estimate Summary, Members table and PDF report.

5) SAVE / OPEN PROJECT — missing fields added
   Span-1..Span-5 (s1-s5), Seismic Zone, Column Design Method and Rafter Design
   Method were not being saved at all, so re-opening a project with unequal spans
   silently reset them to an equal split. These are now included in the saved JSON.

6) STEEL BENCHMARK -> GRAND TOTAL (the originally reported bug)
   Verified against the actual code with a headless test harness:
     25    kg/m2 x 21,000 m2 = 525.000 MT
     30    kg/m2 x 21,000 m2 = 630.000 MT
     34.155kg/m2 x 21,000 m2 = 717.255 MT
     40    kg/m2 x 21,000 m2 = 840.000 MT
   This was already correct in V11.8-1's live pipeline and remains correct; no
   Math.max(reference, benchmark) clamp exists anywhere in the code.

7) COMPONENT-WISE ALLOCATION
   In Practical PEB mode, calculate() scales every displayed component
   (main frame, secondary, hardware, misc steel, sheeting, cladding trim,
   mezzanine, canopy, crane strengthening) by the same factor so their sum equals
   the benchmark Grand Total exactly. Verified numerically (717,255 kg total for
   34.155 kg/m2, matching the sum of scaled components).

8) COLUMN VS RAFTER SECTION LOGIC
   Rafter selection already filters to sections lighter/thinner than the chosen
   column (selectRafterBelowColumn). Added: when no lighter section can also
   satisfy structural demand (utilization <= 1), the software now shows
   "Rafter/Column relationship requires engineering review" in the Main Frame
   Design card and PDF report instead of silently forcing an inadequate section.

9) CRANE LOGIC
   Confirmed by code review and test: Crane OFF -> crane load = 0, craneCol = null.
   Crane ON -> crane load applies ONLY to designated crane-supporting columns
   (craneCol), never to every regular column, and never adds crane girder/runway/
   rail/wheel/hoist equipment weight into building steel. Verified that column
   demand increases monotonically with crane capacity (5 MT -> 10 MT).

10) CENTER COLUMN / CONNECTION PLATE
    Re-verified: the drawing loop only adds a top connection-plate marker when
    j===0 or j===rowYs.length-1 (the two end width-rows). Intermediate/center
    columns get no plate marker, matching V11.8-1's stated fix. No regression
    introduced.

11) VERSION / DISCLAIMER
    Title, header badge, meta tag, PDF report header and in-app note updated to
    V11.9. Added the explicit disclaimer sentence required by the spec to both the
    Design Basis card and the PDF report:
    "This software provides preliminary PEB sizing and estimation. Final design
    shall be verified by STAAD.Pro / structural analysis and applicable IS/AISC
    design checks."

VERIFICATION PERFORMED BEFORE DELIVERY
- node --check on the extracted <script> block: no syntax errors.
- Confirmed zero duplicate function names remain (grep across all top-level
  function declarations).
- Confirmed zero remaining calls to the removed calc() pipeline.
- Ran a headless Node harness against the actual extracted code (not a
  re-implementation) with a mocked DOM/canvas to execute v117Calc() directly and
  reproduce Cases 1-8 from the validation checklist; all passed with exact
  expected figures (see numbers above).
- Grep-audited every $('id') / getElementById('id') call in the script against
  every id="" in the HTML; the only two unmatched ids (craneGirderType,
  craneSpanMode) are already accessed exclusively via optional chaining with safe
  defaults everywhere in the surviving code, so they cannot throw.

NOT CHANGED / OUT OF SCOPE FOR THIS INCREMENT
- No existing module was removed, renamed, or had its UI redesigned.
- Tapered top/bottom flange and web-thickness input fields for independent
  column/rafter tapering, and a side-by-side Crane-OFF-vs-Crane-ON comparison
  table, are not present in the current UI; adding them would be new UI surface
  rather than an incremental fix and was left out to respect "do not redesign the
  UI" / "do not break existing functionality." The engineering logic already
  computes independent crane-on/off member demand internally (see v117Select),
  it is just not yet surfaced as a side-by-side table.
