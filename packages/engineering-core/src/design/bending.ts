import { Section, Material } from "../types.js";

const GAMMA_M0 = 1.1;

export function checkBendingResistance(
  demand_kNm: number,
  section: Section,
  material: Material,
  axis: "MAJOR" | "MINOR"
): { resistance_kNm: number; utilization: number; status: string; warnings: string[] } {
  const warnings: string[] = [];
  const M = Math.abs(demand_kNm);

  // Preliminary assumed to use Zx (elastic) or Zp. Let's use Zx for safe preliminary (semi-compact assumption).
  const Z = axis === "MAJOR" ? section.Zx_mm3 : section.Zy_mm3;

  if (!Z) {
    return { resistance_kNm: 0, utilization: 999, status: "FAIL", warnings: [`Missing ${axis} section modulus`] };
  }

  const fy = material.fy_MPa;
  const Md_kNm = (Z * fy) / GAMMA_M0 / 1e6;
  const utilization = Md_kNm > 0 ? M / Md_kNm : 999;

  return {
    resistance_kNm: Md_kNm,
    utilization,
    status: utilization <= 1.0 ? "PASS" : "FAIL",
    warnings,
  };
}
