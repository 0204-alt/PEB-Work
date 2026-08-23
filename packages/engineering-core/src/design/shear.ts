import { Section, Material } from "../types.js";

const GAMMA_M0 = 1.1;

export function checkShearResistance(
  demand_kN: number,
  section: Section,
  material: Material
): { resistance_kN: number; utilization: number; status: string; warnings: string[] } {
  const warnings: string[] = [];
  const V = Math.abs(demand_kN);

  // V_d = (A_v * fy_w) / (sqrt(3) * gamma_m0)
  // We need A_v. For I-sections, A_v = d * t_w.
  // Since we only have section.area_mm2, if we don't have config, we approximate A_v ~ 0.5 * A
  let Av = 0;
  if (section.geometryConfig && section.geometryConfig.type === "BUILT_UP") {
    Av = section.geometryConfig.depth_mm * section.geometryConfig.webThickness_mm;
  } else if (section.geometryConfig && section.geometryConfig.type === "TAPERED") {
    // Average depth for preliminary shear
    const d_avg = (section.geometryConfig.startDepth_mm + section.geometryConfig.endDepth_mm) / 2;
    Av = d_avg * section.geometryConfig.webThickness_mm;
  } else {
    Av = (section.area_mm2 || 0) * 0.5; 
    warnings.push("Approximated shear area as 50% of gross area");
  }

  if (!Av) {
    return { resistance_kN: 0, utilization: 999, status: "FAIL", warnings: ["Missing shear area"] };
  }

  const fy = material.fy_MPa;
  const Vd_kN = (Av * fy) / (Math.sqrt(3) * GAMMA_M0 * 1000);
  const utilization = Vd_kN > 0 ? V / Vd_kN : 999;

  return {
    resistance_kN: Vd_kN,
    utilization,
    status: utilization <= 1.0 ? "PASS" : "FAIL",
    warnings,
  };
}
