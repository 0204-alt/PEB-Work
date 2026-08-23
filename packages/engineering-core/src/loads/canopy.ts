import { Geometry, LoadCase } from "../types";
import { createId } from "../ids";

export function generateCanopyLoads(
  projectId: string,
  designBasisId: string,
  geometry: Geometry
): LoadCase[] {
  const cases: LoadCase[] = [];
  const config = geometry.canopyConfig;

  if (!config || !config.enabled) {
    return cases;
  }

  const loadCaseId = createId();
  cases.push({
    id: loadCaseId,
    projectId,
    type: "DEAD",
    description: "Canopy Dead Load",
    source: "Canopy Configuration",
    designBasisId,
    status: "VALIDATED_INTERNAL",
    applications: [
      {
        id: createId(),
        loadCaseId,
        targetType: "CANOPY",
        targetId: createId(),
        magnitude: config.deadLoad_kNpm2 ?? 0.15,
        direction: "GY",
        units: "kN/m2",
        source: "Canopy sheeting dead load",
        designBasisRef: "IS 875 Part 1",
        description: "Uniform dead load on canopy",
      }
    ]
  });

  return cases;
}
