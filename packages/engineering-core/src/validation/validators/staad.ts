import { ValidatorFunc, addFinding } from "../types.js";

export const validateStaad: ValidatorFunc = (ctx) => {
  const { project } = ctx;

  for (const record of project.staadExportRecords) {
    if (!record.staadVersionVerified) {
      addFinding(ctx, {
        severity: "WARNING",
        category: "STAAD",
        entityType: "STAAD_EXPORT",
        entityId: record.id,
        code: "UNVERIFIED_STAAD_VERSION",
        message: `STAAD export generated but external target version is not verified.`,
      });
    }

    if (record.status === "EXPORT_BLOCKED") {
      addFinding(ctx, {
        severity: "ERROR",
        category: "STAAD",
        entityType: "STAAD_EXPORT",
        entityId: record.id,
        code: "EXPORT_BLOCKED",
        message: `STAAD export is blocked: ${record.errors.join(", ")}`,
        blocking: true,
      });
    }
  }

  // Cross-check for unsupported sections
  for (const section of project.sections) {
    if (section.geometryConfig && section.geometryConfig.type === "TAPERED") {
       addFinding(ctx, {
        severity: "UNSUPPORTED",
        category: "STAAD",
        entityType: "SECTION",
        entityId: section.id,
        code: "UNSUPPORTED_STAAD_SECTION",
        message: `Tapered section ${section.designation} is not natively supported by basic STAAD generation.`,
        blocking: true, // Blocks STAAD export
      });
    }
  }
};
