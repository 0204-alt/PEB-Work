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

export type FindingInput = Omit<
  ValidationFinding,
  | "id"
  | "runId"
  | "createdAt"
  | "technicalExplanation"
  | "source"
  | "ruleRef"
  | "blocking"
  | "remediationGuidance"
> & {
  technicalExplanation?: string;
  source?: string;
  ruleRef?: string;
  blocking?: boolean;
  remediationGuidance?: string;
};

export function addFinding(ctx: ValidationContext, finding: FindingInput) {
  ctx.findings.push({
    source: "ENGINE",
    technicalExplanation: "",
    ruleRef: "",
    blocking: false,
    remediationGuidance: "",
    ...finding,
    id: createId(),
    runId: ctx.runId,
    createdAt: new Date().toISOString(),
  });
}
