import { DesignBasis, Geometry, LoadCase } from "../types";
import { createId } from "../ids";

export interface WindResult {
  cases: LoadCase[];
  warnings: string[];
  errors: string[];
}

export function calculateWindLoads(
  projectId: string,
  designBasis: DesignBasis,
  geometry: Geometry
): WindResult {
  const windInputs = designBasis.wind;
  const errors: string[] = [];
  const warnings: string[] = [];
  const cases: LoadCase[] = [];

  if (windInputs.basicWindSpeed_mps <= 0) {
    errors.push("Invalid basic wind speed. Must be > 0.");
    return { cases, warnings, errors };
  }

  // IS 875 Part 3: Vz = Vb * k1 * k2 * k3
  const Vb = windInputs.basicWindSpeed_mps;
  const k1 = windInputs.importanceFactor_k1;
  const k2 = windInputs.heightTerrainFactor_k2;
  const k3 = windInputs.topographyFactor_k3;

  const Vz = Vb * k1 * k2 * k3;
  // IS 875 Part 3: Pz = 0.6 * Vz^2 (N/m^2)
  const Pz_N = 0.6 * (Vz * Vz);
  const Pz_kN = Pz_N / 1000;

  const sourceStr = `Calculated based on Vb=${Vb}m/s, k1=${k1}, k2=${k2}, k3=${k3}`;
  
  // Directions
  const directions: Array<"WIND_PLUS_X" | "WIND_MINUS_X" | "WIND_PLUS_Z" | "WIND_MINUS_Z"> = [
    "WIND_PLUS_X",
    "WIND_MINUS_X",
    "WIND_PLUS_Z",
    "WIND_MINUS_Z"
  ];

  for (const dir of directions) {
    const loadCaseId = createId();
    const apps: any[] = [];

    // Wind Pressure on Walls (assume +0.7, -0.5 coefficients for simplicity/demo if project override not specified)
    // The instructions say "Do not guess" and "do not present a fabricated result as engineering output"
    // "Instead: 1. implement surrounding architecture; 2. identify missing provision; 3. mark specific calculation as requiring verified engineering input"
    // If coefficients are missing, we just apply a placeholder with a clear REQUIRES_ENGINEERING_REVIEW status.
    
    // We will generate the base pressure applications.
    apps.push({
      id: createId(),
      loadCaseId,
      targetType: "WALL_SURFACE",
      targetId: createId(),
      magnitude: Pz_kN,
      direction: dir === "WIND_PLUS_X" || dir === "WIND_MINUS_X" ? "GX" : "GZ",
      units: "kN/m2",
      source: sourceStr,
      designBasisRef: "IS 875 Part 3 (Clause 7.2)",
      description: "Design Wind Pressure (Pz) - requires Cp coefficient application",
    });

    cases.push({
      id: loadCaseId,
      projectId,
      type: dir,
      description: `Wind Load ${dir}`,
      source: "Generated IS 875 (Part 3) Wind Pipeline",
      designBasisId: designBasis.id,
      status: "REQUIRES_ENGINEERING_REVIEW", // Because we don't have full Cp inputs yet
      applications: apps,
    });
  }

  // Uplift
  const upliftCaseId = createId();
  cases.push({
    id: upliftCaseId,
    projectId,
    type: "UPLIFT",
    description: `Wind Uplift`,
    source: "Generated IS 875 (Part 3) Wind Pipeline",
    designBasisId: designBasis.id,
    status: "REQUIRES_ENGINEERING_REVIEW",
    applications: [
      {
        id: createId(),
        loadCaseId: upliftCaseId,
        targetType: "ROOF_SURFACE",
        targetId: createId(),
        magnitude: Pz_kN, 
        direction: "LOCAL_Y", // upward normal
        units: "kN/m2",
        source: sourceStr,
        designBasisRef: "IS 875 Part 3",
        description: "Uplift Pressure (Pz) - requires Cp coefficient application",
      }
    ],
  });

  return { cases, warnings, errors };
}
