import { LoadCase } from "../types";
import { createId } from "../ids";

export function generateCollateralLoadCase(
  projectId: string,
  designBasisId: string
): LoadCase {
  const loadCaseId = createId();

  return {
    id: loadCaseId,
    projectId,
    type: "COLLATERAL",
    description: "Collateral Load (Services/Lighting)",
    source: "Standard project assumption",
    designBasisId,
    status: "PRELIMINARY",
    applications: [
      {
        id: createId(),
        loadCaseId,
        targetType: "ROOF_SURFACE",
        targetId: createId(),
        magnitude: 0.1, // Typical collateral load assumption
        direction: "GY",
        units: "kN/m2",
        source: "Preliminary uniform collateral assumption",
        designBasisRef: "IS 875 Part 1",
        description: "Services, ducts, lighting",
      }
    ],
  };
}
