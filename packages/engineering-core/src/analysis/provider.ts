import { createId } from "../ids.js";
import type { CanonicalProject, AnalysisRun } from "../types.js";
import { computeAnalysisHash } from "../hash.js";
import { validateAnalysisModel } from "./validation.js";

export interface AnalysisProvider {
  /**
   * Generates a deterministic hash, validates the model, and attempts structural analysis.
   */
  analyze(project: CanonicalProject): Promise<AnalysisRun>;
}

export class UnavailableAnalysisProvider implements AnalysisProvider {
  async analyze(project: CanonicalProject): Promise<AnalysisRun> {
    const modelHash = computeAnalysisHash(project);
    
    const run: AnalysisRun = {
      id: createId(),
      projectId: project.id,
      provider: "UNAVAILABLE",
      providerVersion: "1.0.0",
      modelHash,
      status: "REQUIRES_ENGINEERING_REVIEW",
      diagnostics: [],
      memberResults: [], // Empty array, NO fake zero forces!
      nodeResults: [],   // Empty array, NO fake zero reactions!
      createdAt: new Date().toISOString(),
      duration_ms: 0,
    };

    // 1. Validation phase
    const validation = validateAnalysisModel(project);
    if (validation.hasErrors) {
      run.status = "ANALYSIS_BLOCKED";
      run.diagnostics.push("Analysis blocked due to validation errors.");
      run.diagnostics.push(...validation.errors);
      return run;
    }

    if (validation.warnings.length > 0) {
      run.diagnostics.push(...validation.warnings);
    }

    // 2. Execution phase (Fallback)
    run.diagnostics.push("No validated structural analysis solver is configured.");
    
    return run;
  }
}
