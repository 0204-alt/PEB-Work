import { CanonicalProject, ValidationRun, ValidationFinding, OperationReadiness } from "../types.js";
import { createId } from "../ids.js";

export interface ValidationContext {
  project: CanonicalProject;
  runId: string;
  findings: ValidationFinding[];
  gates: {
    projectSave: OperationReadiness;
    geometry: OperationReadiness;
    design: OperationReadiness;
    analysis: OperationReadiness;
    staadExport: OperationReadiness;
    quantity: OperationReadiness;
  };
}

export type ValidatorFunc = (ctx: ValidationContext) => void;

export function addFinding(ctx: ValidationContext, finding: Omit<ValidationFinding, "id" | "runId" | "createdAt">) {
  ctx.findings.push({
    ...finding,
    id: createId(),
    runId: ctx.runId,
    createdAt: new Date().toISOString(),
  });
}
