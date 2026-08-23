import { Geometry, LoadCase } from "../types";
import { createId } from "../ids";

export function generateMezzanineLoads(
  projectId: string,
  designBasisId: string,
  geometry: Geometry
): LoadCase[] {
  const cases: LoadCase[] = [];
  const config = geometry.mezzanineConfig;

  if (!config || !config.enabled) {
    return cases;
  }

  // Dead Load
  const deadCaseId = createId();
  cases.push({
    id: deadCaseId,
    projectId,
    type: "DEAD",
    description: "Mezzanine Dead Load",
    source: "Mezzanine Configuration",
    designBasisId,
    status: "VALIDATED_INTERNAL",
    applications: [
      {
        id: createId(),
        loadCaseId: deadCaseId,
        targetType: "MEZZANINE",
        targetId: createId(),
        magnitude: config.deadLoad_kNpm2 ?? 3.0,
        direction: "GY",
        units: "kN/m2",
        source: "Mezzanine finishing + self-weight assumption",
        designBasisRef: "IS 875 Part 1",
        description: "Uniform dead load on mezzanine deck",
      }
    ]
  });

  // Imposed / Live Load
  const liveCaseId = createId();
  cases.push({
    id: liveCaseId,
    projectId,
    type: "LIVE",
    description: "Mezzanine Live Load",
    source: "Mezzanine Configuration",
    designBasisId,
    status: "VALIDATED_INTERNAL",
    applications: [
      {
        id: createId(),
        loadCaseId: liveCaseId,
        targetType: "MEZZANINE",
        targetId: createId(),
        magnitude: config.liveLoad_kNpm2 ?? 4.0,
        direction: "GY",
        units: "kN/m2",
        source: "Mezzanine occupancy",
        designBasisRef: "IS 875 Part 2",
        description: "Uniform live load on mezzanine deck",
      }
    ]
  });

  return cases;
}
