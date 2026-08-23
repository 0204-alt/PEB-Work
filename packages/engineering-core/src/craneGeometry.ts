import { createId } from "./ids.js";
import type { Geometry, Node, Member, CraneConfig } from "./types.js";

export function generateCraneGeometry(
  craneConfig: CraneConfig,
  config: Geometry,
  nodes: Node[],
  members: Member[]
) {
  if (!craneConfig.craneEnabled) return;
  if (craneConfig.runwayElevation_m === undefined) return;
  if (!craneConfig.craneId) return;

  const yElevation = craneConfig.runwayElevation_m;

  // We need to identify supporting columns along grid lines.
  // We assume cranes run longitudinally along Z, supported by frames at each X grid.
  // The crane runway span typically spans between columns in the transverse (X) direction,
  // or it runs along the outer columns. Let's find columns that exist.
  const columns = members.filter(
    (m) =>
      m.type === "COLUMN" ||
      m.type === "END_WALL_COLUMN" ||
      m.type === "TAPERED_COLUMN"
  );

  // Group columns by their X grid line coordinate
  const columnsByX = new Map<number, Member[]>();
  for (const col of columns) {
    const startNode = nodes.find((n) => n.id === col.startNodeId);
    if (!startNode) continue;
    const xKey = startNode.x_m;
    if (!columnsByX.has(xKey)) {
      columnsByX.set(xKey, []);
    }
    columnsByX.get(xKey)!.push(col);
  }

  // Find Z grids from bays to place runway beams
  // For a single crane, we assume it spans between the two outermost Z grid lines
  const zCoords = Array.from(
    new Set(
      columns.map((c) => {
        const start = nodes.find((n) => n.id === c.startNodeId);
        return start ? start.z_m : 0;
      })
    )
  ).sort((a, b) => a - b);

  if (zCoords.length < 2) return; // Need at least two sides for a bridge crane

  const zLeft = zCoords[0];
  const zRight = zCoords[zCoords.length - 1];

  // We iterate over the X grids in order
  const xGrids = Array.from(columnsByX.keys()).sort((a, b) => a - b);

  const runwayNodesLeft: Node[] = [];
  const runwayNodesRight: Node[] = [];

  for (let i = 0; i < xGrids.length; i++) {
    const x = xGrids[i];
    
    // Create CRANE_SUPPORT node at left
    const leftNode: Node = {
      id: createId(),
      projectId: config.projectId,
      label: `N-CRANE-SUPP-L-${i + 1}`,
      x_m: x,
      y_m: yElevation,
      z_m: zLeft,
      role: "CRANE_SUPPORT",
      metadata: { generatedBy: "CRANE_SYSTEM", craneId: craneConfig.craneId },
    };
    nodes.push(leftNode);
    runwayNodesLeft.push(leftNode);

    // Create CRANE_SUPPORT node at right
    const rightNode: Node = {
      id: createId(),
      projectId: config.projectId,
      label: `N-CRANE-SUPP-R-${i + 1}`,
      x_m: x,
      y_m: yElevation,
      z_m: zRight,
      role: "CRANE_SUPPORT",
      metadata: { generatedBy: "CRANE_SYSTEM", craneId: craneConfig.craneId },
    };
    nodes.push(rightNode);
    runwayNodesRight.push(rightNode);
  }

  // Create runway beams between successive supports
  for (let i = 0; i < xGrids.length - 1; i++) {
    const l1 = runwayNodesLeft[i];
    const l2 = runwayNodesLeft[i + 1];
    
    const lengthL = Math.sqrt(
      Math.pow(l2.x_m - l1.x_m, 2) + 
      Math.pow(l2.y_m - l1.y_m, 2) + 
      Math.pow(l2.z_m - l1.z_m, 2)
    );

    members.push({
      id: createId(),
      projectId: config.projectId,
      label: `M-CRANE-RW-L-${i + 1}`,
      type: "CRANE_RUNWAY",
      startNodeId: l1.id,
      endNodeId: l2.id,
      designGroup: "Crane Runways",
      length_m: lengthL,
      quantity: 1,
      weightStatus: "NOT_IMPLEMENTED",
      metadata: { generatedBy: "CRANE_SYSTEM", craneId: craneConfig.craneId },
    });

    const r1 = runwayNodesRight[i];
    const r2 = runwayNodesRight[i + 1];

    const lengthR = Math.sqrt(
      Math.pow(r2.x_m - r1.x_m, 2) + 
      Math.pow(r2.y_m - r1.y_m, 2) + 
      Math.pow(r2.z_m - r1.z_m, 2)
    );

    members.push({
      id: createId(),
      projectId: config.projectId,
      label: `M-CRANE-RW-R-${i + 1}`,
      type: "CRANE_RUNWAY",
      startNodeId: r1.id,
      endNodeId: r2.id,
      designGroup: "Crane Runways",
      length_m: lengthR,
      quantity: 1,
      weightStatus: "NOT_IMPLEMENTED",
      metadata: { generatedBy: "CRANE_SYSTEM", craneId: craneConfig.craneId },
    });
  }
}
