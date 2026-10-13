import { ValidatorFunc, addFinding } from "../types.js";

export const validateQuantity: ValidatorFunc = (ctx) => {
  const { project } = ctx;

  if (project.benchmark.enabled && project.benchmark.kgPerM2) {
    addFinding(ctx, {
      severity: "WARNING",
      category: "QUANTITY",
      code: "INVALID_QUANTITY_SOURCE",
      message: `kg/m2 is a valid reporting metric, but must not be used as the source for structural quantity estimates.`,
      blocking: false,
    });
  }

  // Ensure connection components have defined status
  for (const connection of project.connections) {
    for (const comp of connection.components) {
      if (comp.status === "NOT_YET_DEFINED") {
        addFinding(ctx, {
          severity: "NOT_YET_DEFINED",
          category: "QUANTITY",
          entityType: "CONNECTION_COMPONENT",
          entityId: comp.id,
          code: "UNDEFINED_COMPONENT",
          message: `Connection component ${comp.type} is undefined and cannot contribute to verified quantity.`,
          blocking: false, // Does not block save, but will be aggregated to block verified quantity
        });
        
        if (comp.mass_kg > 0) {
          addFinding(ctx, {
            severity: "ERROR",
            category: "QUANTITY",
            entityType: "CONNECTION_COMPONENT",
            entityId: comp.id,
            code: "FABRICATED_MASS",
            message: `Undefined connection component ${comp.type} has fabricated mass > 0.`,
            blocking: true,
          });
        }
      }
    }
  }

  // Ensure members have valid unit mass if their weight is used
  for (const member of project.structuralModel.members) {
    if (member.weightStatus === "VALIDATED_INTERNAL" && (member.unitMass_kgpm === undefined || member.unitMass_kgpm <= 0)) {
      addFinding(ctx, {
        severity: "ERROR",
        category: "QUANTITY",
        entityType: "MEMBER",
        entityId: member.id,
        code: "INVALID_UNIT_MASS",
        message: `Member ${member.label} claims verified weight but has no valid unit mass.`,
        blocking: true,
      });
    }
  }
};
