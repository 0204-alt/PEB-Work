import { createId } from "./ids.js";
import type { Geometry, GridLine, Bay, Span, Node, Member } from "./types.js";

export interface GridSystemResult {
  gridLines: GridLine[];
  bays: Bay[];
  spans: Span[];
}

export interface GeometryResult extends GridSystemResult {
  nodes: Node[];
  members: Member[];
}

// Helper to parse slope "1:10" -> 0.1
function parseSlope(riseRun: string): number {
  const parts = riseRun.split(":");
  if (parts.length !== 2) return 0;
  const rise = parseFloat(parts[0]);
  const run = parseFloat(parts[1]);
  if (isNaN(rise) || isNaN(run) || run === 0) return 0;
  return rise / run;
}

export function generateGridSystem(
  length_m: number,
  width_m: number,
  baySpacing_m?: number,
  numberOfBays?: number,
  unequalFinalBay: boolean = false
): GridSystemResult {
  const gridLines: GridLine[] = [];
  const bays: Bay[] = [];
  const spans: Span[] = [];

  const zGridLine1: GridLine = {
    id: createId(),
    axis: "Z",
    index: 0,
    coordinate_m: 0,
    label: "A",
  };
  
  const zGridLine2: GridLine = {
    id: createId(),
    axis: "Z",
    index: 1,
    coordinate_m: width_m,
    label: "B",
  };
  
  gridLines.push(zGridLine1, zGridLine2);

  const span1: Span = {
    id: createId(),
    index: 0,
    startZ_m: 0,
    endZ_m: width_m,
    width_m: width_m,
  };
  
  spans.push(span1);

  let actualBays = 0;
  let defaultSpacing = 0;

  if (baySpacing_m && !numberOfBays) {
    if (unequalFinalBay) {
      actualBays = Math.ceil(length_m / baySpacing_m);
      defaultSpacing = baySpacing_m;
    } else {
      actualBays = Math.round(length_m / baySpacing_m);
      defaultSpacing = length_m / actualBays;
    }
  } else if (numberOfBays && !baySpacing_m) {
    actualBays = numberOfBays;
    defaultSpacing = length_m / actualBays;
  } else if (baySpacing_m && numberOfBays) {
    actualBays = numberOfBays;
    defaultSpacing = baySpacing_m;
  } else {
    actualBays = 1;
    defaultSpacing = length_m;
  }

  let currentX = 0;
  
  gridLines.push({
    id: createId(),
    axis: "X",
    index: 0,
    coordinate_m: 0,
    label: "1",
  });

  for (let i = 0; i < actualBays; i++) {
    const isLast = i === actualBays - 1;
    let length = defaultSpacing;
    
    if (isLast && unequalFinalBay && baySpacing_m) {
      const remainder = length_m - currentX;
      if (remainder > 0) {
        length = remainder;
      }
    }

    const startX = currentX;
    const endX = currentX + length;
    
    bays.push({
      id: createId(),
      index: i,
      startX_m: startX,
      endX_m: endX,
      length_m: length,
    });

    currentX = endX;

    gridLines.push({
      id: createId(),
      axis: "X",
      index: i + 1,
      coordinate_m: currentX,
      label: (i + 2).toString(),
    });
  }

  return { gridLines, bays, spans };
}

export function generateGeometry(config: Geometry): GeometryResult {
  const { gridLines, bays, spans } = generateGridSystem(
    config.length_m,
    config.width_m,
    config.baySpacing_m,
    config.numberOfBays,
    config.unequalFinalBay
  );

  const nodes: Node[] = [];
  const members: Member[] = [];
  const slope = parseSlope(config.roofSlopeRiseRun);

  const xGrids = gridLines.filter(g => g.axis === "X").sort((a, b) => a.coordinate_m - b.coordinate_m);
  const zGrids = gridLines.filter(g => g.axis === "Z").sort((a, b) => a.coordinate_m - b.coordinate_m);

  // For each frame (X grid line)
  for (const xGrid of xGrids) {
    const isEndWall = xGrid.index === 0 || xGrid.index === xGrids.length - 1;

    // We generate a main frame at each X grid line
    // For single span, Z=0 and Z=width
    
    // 1. Column Bases and Eaves
    const colA_base: Node = {
      id: createId(),
      projectId: config.projectId,
      label: `N-Base-${xGrid.label}-A`,
      x_m: xGrid.coordinate_m,
      y_m: 0,
      z_m: zGrids[0].coordinate_m,
      role: "BASE",
      gridLineId: xGrid.id,
      metadata: {},
    };

    const colA_eave: Node = {
      id: createId(),
      projectId: config.projectId,
      label: `N-Eave-${xGrid.label}-A`,
      x_m: xGrid.coordinate_m,
      y_m: config.eaveHeight_m,
      z_m: zGrids[0].coordinate_m,
      role: "EAVE",
      gridLineId: xGrid.id,
      metadata: {},
    };

    const colB_base: Node = {
      id: createId(),
      projectId: config.projectId,
      label: `N-Base-${xGrid.label}-B`,
      x_m: xGrid.coordinate_m,
      y_m: 0,
      z_m: zGrids[1].coordinate_m,
      role: "BASE",
      gridLineId: xGrid.id,
      metadata: {},
    };

    const colB_eave: Node = {
      id: createId(),
      projectId: config.projectId,
      label: `N-Eave-${xGrid.label}-B`,
      x_m: xGrid.coordinate_m,
      y_m: config.eaveHeight_m,
      z_m: zGrids[1].coordinate_m,
      role: "EAVE",
      gridLineId: xGrid.id,
      metadata: {},
    };

    // Ridge Node (center of the span)
    const spanWidth = zGrids[1].coordinate_m - zGrids[0].coordinate_m;
    const ridgeHeight = config.eaveHeight_m + (spanWidth / 2) * slope;
    
    const ridgeNode: Node = {
      id: createId(),
      projectId: config.projectId,
      label: `N-Ridge-${xGrid.label}`,
      x_m: xGrid.coordinate_m,
      y_m: ridgeHeight,
      z_m: zGrids[0].coordinate_m + spanWidth / 2,
      role: "RIDGE",
      gridLineId: xGrid.id,
      metadata: {},
    };

    nodes.push(colA_base, colA_eave, colB_base, colB_eave, ridgeNode);

    // Create Main Members
    // Columns
    const colType = isEndWall ? "END_WALL_COLUMN" : "COLUMN";
    members.push({
      id: createId(),
      projectId: config.projectId,
      label: `M-${colType}-${xGrid.label}-A`,
      type: colType,
      startNodeId: colA_base.id,
      endNodeId: colA_eave.id,
      designGroup: isEndWall ? "Endwall Columns" : "Main Columns",
      length_m: config.eaveHeight_m,
      quantity: 1,
      weightStatus: "NOT_IMPLEMENTED"
    });

    members.push({
      id: createId(),
      projectId: config.projectId,
      label: `M-${colType}-${xGrid.label}-B`,
      type: colType,
      startNodeId: colB_base.id,
      endNodeId: colB_eave.id,
      designGroup: isEndWall ? "Endwall Columns" : "Main Columns",
      length_m: config.eaveHeight_m,
      quantity: 1,
      weightStatus: "NOT_IMPLEMENTED"
    });

    // Rafters
    const rafterLength = Math.sqrt(Math.pow(spanWidth / 2, 2) + Math.pow(ridgeHeight - config.eaveHeight_m, 2));
    
    members.push({
      id: createId(),
      projectId: config.projectId,
      label: `M-RAFTER-${xGrid.label}-A`,
      type: "RAFTER",
      startNodeId: colA_eave.id,
      endNodeId: ridgeNode.id,
      designGroup: "Main Rafters",
      length_m: rafterLength,
      quantity: 1,
      weightStatus: "NOT_IMPLEMENTED"
    });

    members.push({
      id: createId(),
      projectId: config.projectId,
      label: `M-RAFTER-${xGrid.label}-B`,
      type: "RAFTER",
      startNodeId: colB_eave.id,
      endNodeId: ridgeNode.id,
      designGroup: "Main Rafters",
      length_m: rafterLength,
      quantity: 1,
      weightStatus: "NOT_IMPLEMENTED"
    });
  }

  return { gridLines, bays, spans, nodes, members };
}
