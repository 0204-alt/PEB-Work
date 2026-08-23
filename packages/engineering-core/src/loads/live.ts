import { LoadCase } from "../types";
import { createId } from "../ids";

export function generateLiveLoadCase(
  projectId: string,
  designBasisId: string
): LoadCase {
  const loadCaseId = createId();

  return {
    id: loadCaseId,
    projectId,
    type: "LIVE",
    description: "Roof Live/Imposed Load",
    source: "Generated Roof Live Load",
    designBasisId,
    status: "REQUIRES_ENGINEERING_REVIEW",
    applications: [
      {
        id: createId(),
        loadCaseId,
        targetType: "ROOF_SURFACE",
        targetId: createId(),
        magnitude: 0.75, // Basic assumed live load for inaccessible roof
        direction: "GY",
        units: "kN/m2",
        source: "IS 875 Part 2 - Inaccessible roof assumption",
        designBasisRef: "IS 875 Part 2",
        description: "Uniform live load on roof",
      }
    ],
  };
}
