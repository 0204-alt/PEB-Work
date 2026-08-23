import { CanonicalProject, LoadCase, LoadCombination } from "../types";
import { generateDeadLoadCase } from "./dead";
import { generateLiveLoadCase } from "./live";
import { generateCollateralLoadCase } from "./collateral";
import { calculateWindLoads } from "./wind";
import { generateCraneLoads } from "./crane";
import { generateMezzanineLoads } from "./mezzanine";
import { generateCanopyLoads } from "./canopy";
import { generateCombinations } from "./combinations";

export interface LoadGenerationResult {
  loadCases: LoadCase[];
  loadCombinations: LoadCombination[];
  errors: string[];
  warnings: string[];
}

export function generateLoads(project: CanonicalProject): LoadGenerationResult {
  const loadCases: LoadCase[] = [];
  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. Dead Load
  const deadCase = generateDeadLoadCase(
    project.id,
    project.designBasis.id,
    project.structuralModel.members,
    project.sections
  );
  loadCases.push(deadCase);

  // 2. Live / Imposed Load
  loadCases.push(generateLiveLoadCase(project.id, project.designBasis.id));

  // 3. Collateral Load
  loadCases.push(generateCollateralLoadCase(project.id, project.designBasis.id));

  // 4. Wind Loads
  const windResult = calculateWindLoads(project.id, project.designBasis, project.geometry);
  loadCases.push(...windResult.cases);
  errors.push(...windResult.errors);
  warnings.push(...windResult.warnings);

  // 5. Crane Loads
  if (project.geometry.craneConfig) {
    loadCases.push(...generateCraneLoads(
      project.geometry.craneConfig,
      project.geometry,
      project.structuralModel.nodes,
      project.structuralModel.members
    ));
  }

  // 6. Mezzanine Loads
  loadCases.push(...generateMezzanineLoads(project.id, project.designBasis.id, project.geometry));

  // 7. Canopy Loads
  loadCases.push(...generateCanopyLoads(project.id, project.designBasis.id, project.geometry));

  // 8. Seismic Loads
  if (project.designBasis.seismic.applicable) {
    warnings.push("Seismic loads requested but full seismic engine is pending review.");
  }

  // Generate Combinations based on the generated cases
  const loadCombinations = generateCombinations(project.id, loadCases);

  return { loadCases, loadCombinations, errors, warnings };
}
