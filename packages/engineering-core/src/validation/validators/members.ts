import { ValidatorFunc, addFinding } from "../types.js";

export const validateMembers: ValidatorFunc = (ctx) => {
  const { project } = ctx;
  const { structuralModel } = project;

  const validNodes = new Set(structuralModel.nodes.map(n => n.id));
  const validSections = new Set(project.sections.map(s => s.id));
  const validMaterials = new Set(project.materials.map(m => m.id));

  // Check duplicate members (same start and end nodes, or vice versa)
  const memberPairs = new Set<string>();

  for (const member of structuralModel.members) {
    // Basic connectivity
    if (!validNodes.has(member.startNodeId)) {
      addFinding(ctx, {
        severity: "ERROR",
        category: "MEMBERS",
        entityType: "MEMBER",
        entityId: member.id,
        code: "INVALID_START_NODE",
        message: `Member ${member.label} references missing start node ${member.startNodeId}.`,
        blocking: true,
      });
    }
    if (!validNodes.has(member.endNodeId)) {
      addFinding(ctx, {
        severity: "ERROR",
        category: "MEMBERS",
        entityType: "MEMBER",
        entityId: member.id,
        code: "INVALID_END_NODE",
        message: `Member ${member.label} references missing end node ${member.endNodeId}.`,
        blocking: true,
      });
    }

    if (member.startNodeId === member.endNodeId) {
       addFinding(ctx, {
        severity: "ERROR",
        category: "MEMBERS",
        entityType: "MEMBER",
        entityId: member.id,
        code: "ZERO_LENGTH_MEMBER",
        message: `Member ${member.label} has the same start and end node, resulting in zero length.`,
        blocking: true,
      });
    } else {
      const pair = [member.startNodeId, member.endNodeId].sort().join("-");
      if (memberPairs.has(pair)) {
        addFinding(ctx, {
          severity: "WARNING",
          category: "MEMBERS",
          entityType: "MEMBER",
          entityId: member.id,
          code: "DUPLICATE_MEMBER",
          message: `Member ${member.label} connects the same nodes as another member.`,
          blocking: false,
        });
      }
      memberPairs.add(pair);
    }

    if (member.length_m <= 0) {
      addFinding(ctx, {
        severity: "ERROR",
        category: "MEMBERS",
        entityType: "MEMBER",
        entityId: member.id,
        code: "INVALID_LENGTH",
        message: `Member ${member.label} has non-positive length ${member.length_m}.`,
        blocking: true,
      });
    }

    if (member.sectionId && !validSections.has(member.sectionId)) {
      addFinding(ctx, {
        severity: "ERROR",
        category: "MEMBERS",
        entityType: "MEMBER",
        entityId: member.id,
        code: "INVALID_SECTION_REF",
        message: `Member ${member.label} references missing section ${member.sectionId}.`,
        blocking: true,
      });
    }

    if (member.materialId && !validMaterials.has(member.materialId)) {
      addFinding(ctx, {
        severity: "ERROR",
        category: "MEMBERS",
        entityType: "MEMBER",
        entityId: member.id,
        code: "INVALID_MATERIAL_REF",
        message: `Member ${member.label} references missing material ${member.materialId}.`,
        blocking: true,
      });
    }
  }
};
