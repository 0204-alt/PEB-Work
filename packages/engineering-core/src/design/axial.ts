import { Section, Material } from "../types.js";

const GAMMA_M0 = 1.1;

export function checkAxialResistance(
  demand_kN: number, // positive = tension, negative = compression
  section: Section,
  material: Material,
  effectiveLength_m: number
): { resistance_kN: number; utilization: number; status: string; warnings: string[] } {
  const warnings: string[] = [];
  
  if (!section.area_mm2) {
    return { resistance_kN: 0, utilization: 999, status: "FAIL", warnings: ["Missing section area"] };
  }

  const Ag = section.area_mm2;
  const fy = material.fy_MPa;

  if (demand_kN >= 0) {
    // Tension (IS 800:2007 Cl 6.2 - Gross section yielding)
    const Td_kN = (Ag * fy) / GAMMA_M0 / 1000;
    const utilization = demand_kN / Td_kN;
    return {
      resistance_kN: Td_kN,
      utilization,
      status: utilization <= 1.0 ? "PASS" : "FAIL",
      warnings,
    };
  } else {
    // Compression (IS 800:2007 Cl 7.1 - Design Compressive Strength)
    // P_d = A_e * f_cd
    const P = Math.abs(demand_kN);
    
    // Slenderness lambda
    const r_min = Math.min(section.rx_mm || 9999, section.ry_mm || 9999);
    if (r_min === 9999) {
      warnings.push("Missing radius of gyration, assuming arbitrary low resistance");
      return { resistance_kN: 0.1, utilization: P / 0.1, status: "FAIL", warnings };
    }

    const KL = effectiveLength_m * 1000;
    const slenderness = KL / r_min;
    
    // Euler buckling stress fcc
    const E = material.E_MPa;
    const fcc = (Math.PI * Math.PI * E) / (slenderness * slenderness);
    
    // Non-dimensional slenderness lambda_nd = sqrt(fy / fcc)
    const lambda_nd = Math.sqrt(fy / fcc);
    
    // Imperfection factor alpha (assume curve c for preliminary: 0.49)
    const alpha = 0.49;
    
    const phi = 0.5 * (1 + alpha * (lambda_nd - 0.2) + lambda_nd * lambda_nd);
    
    const fcd = (fy / GAMMA_M0) / (phi + Math.sqrt(Math.max(0, phi * phi - lambda_nd * lambda_nd)));
    
    // Check capping
    const fcd_final = Math.min(fcd, fy / GAMMA_M0);
    
    const Pd_kN = (Ag * fcd_final) / 1000;
    const utilization = P / Pd_kN;
    
    return {
      resistance_kN: Pd_kN,
      utilization,
      status: utilization <= 1.0 ? "PASS" : "FAIL",
      warnings,
    };
  }
}
