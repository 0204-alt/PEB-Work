import { Section } from "../types.js";

export function checkSlenderness(
  section: Section,
  effectiveLength_m: number,
  isCompression: boolean
): { slenderness: number; limit: number; utilization: number; status: string; warnings: string[] } {
  const warnings: string[] = [];
  
  const r_min = Math.min(section.rx_mm || 9999, section.ry_mm || 9999);
  if (r_min === 9999) {
    warnings.push("Missing radius of gyration, slenderness check invalid");
    return { slenderness: 999, limit: 1, utilization: 999, status: "FAIL", warnings };
  }

  const KL = effectiveLength_m * 1000;
  const slenderness = KL / r_min;

  // IS 800:2007 Table 3
  // Member carrying compressive loads resulting from dead loads and imposed loads = 180
  // Tension member = 400 (or 250/350 depending on reversal)
  const limit = isCompression ? 180 : 350; 
  const utilization = slenderness / limit;

  return {
    slenderness,
    limit,
    utilization,
    status: utilization <= 1.0 ? "PASS" : "FAIL",
    warnings,
  };
}
