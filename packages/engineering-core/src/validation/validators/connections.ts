import { ValidatorFunc, addFinding } from "../types.js";

export const validateConnections: ValidatorFunc = (ctx) => {
  const { project } = ctx;

  for (const connection of project.connections) {
    if (connection.sourceMemberIds.length === 0 && !connection.nodeId) {
      addFinding(ctx, {
        severity: "WARNING",
        category: "CONNECTIONS",
        entityType: "CONNECTION",
        entityId: connection.id,
        code: "ORPHAN_CONNECTION",
        message: `Connection ${connection.type} has no associated members or node.`,
      });
    }

    if (connection.components.length === 0) {
      addFinding(ctx, {
        severity: "INFO",
        category: "CONNECTIONS",
        entityType: "CONNECTION",
        entityId: connection.id,
        code: "EMPTY_CONNECTION",
        message: `Connection ${connection.type} has no components defined yet.`,
      });
    }
  }
};
