import { ValidatorFunc, addFinding } from "../types.js";

export const validateConnectivity: ValidatorFunc = (ctx) => {
  const { project } = ctx;

  const validNodes = new Set(project.structuralModel.nodes.map(n => n.id));
  const validMembers = new Set(project.structuralModel.members.map(m => m.id));

  for (const support of project.structuralModel.supports) {
    if (!validNodes.has(support.nodeId)) {
      addFinding(ctx, {
        severity: "ERROR",
        category: "SUPPORTS",
        entityType: "SUPPORT",
        entityId: support.id,
        code: "INVALID_NODE_REF",
        message: `Support references missing node ${support.nodeId}.`,
        blocking: true,
      });
    }
  }

  for (const release of project.structuralModel.releases) {
    if (!validMembers.has(release.memberId)) {
      addFinding(ctx, {
        severity: "ERROR",
        category: "RELEASES",
        entityType: "RELEASE",
        entityId: release.id,
        code: "INVALID_MEMBER_REF",
        message: `Release references missing member ${release.memberId}.`,
        blocking: true,
      });
    }
  }
};
