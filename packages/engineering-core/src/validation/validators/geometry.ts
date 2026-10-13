import { ValidatorFunc, addFinding } from "../types.js";

export const validateGeometry: ValidatorFunc = (ctx) => {
  const { project } = ctx;
  const { geometry, structuralModel } = project;

  // Verify units
  if (project.designBasis.units.length !== "m") {
    addFinding(ctx, {
      severity: "WARNING",
      category: "GEOMETRY",
      code: "INVALID_LENGTH_UNIT",
      message: `Expected geometry units in 'm', found '${project.designBasis.units.length}'.`,
    });
  }

  // Check duplicate nodes
  const nodeMap = new Map<string, number>();
  for (const node of structuralModel.nodes) {
    const key = `${node.x_m.toFixed(3)},${node.y_m.toFixed(3)},${node.z_m.toFixed(3)}`;
    nodeMap.set(key, (nodeMap.get(key) || 0) + 1);
  }

  for (const node of structuralModel.nodes) {
    const key = `${node.x_m.toFixed(3)},${node.y_m.toFixed(3)},${node.z_m.toFixed(3)}`;
    if ((nodeMap.get(key) || 0) > 1) {
      addFinding(ctx, {
        severity: "ERROR",
        category: "GEOMETRY",
        entityType: "NODE",
        entityId: node.id,
        code: "DUPLICATE_NODE",
        message: `Node ${node.label} shares exact coordinates with another node.`,
        blocking: true,
      });
    }
  }

  // Find floating nodes (nodes with no members attached, except if they have a support)
  const connectedNodes = new Set<string>();
  for (const member of structuralModel.members) {
    connectedNodes.add(member.startNodeId);
    connectedNodes.add(member.endNodeId);
  }
  for (const support of structuralModel.supports) {
    connectedNodes.add(support.nodeId);
  }
  for (const node of structuralModel.nodes) {
    if (!connectedNodes.has(node.id)) {
      addFinding(ctx, {
        severity: "WARNING",
        category: "GEOMETRY",
        entityType: "NODE",
        entityId: node.id,
        code: "FLOATING_NODE",
        message: `Node ${node.label} is floating (not connected to any member or support).`,
        blocking: false,
      });
    }
  }
};
