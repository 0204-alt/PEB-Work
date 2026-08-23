import type { Material } from "./types.js";
import { z } from "zod";

// Calculate Shear Modulus (G) deterministically
export function calculateShearModulus(eMPa: number, poisson: number): number {
  return eMPa / (2 * (1 + poisson));
}

// Generate deterministic material properties
export function generateMaterialProperties(
  name: string,
  grade: string,
  fy_MPa: number,
  fu_MPa: number,
  E_MPa: number,
  poisson: number,
  density_kgpm3: number
): Omit<Material, "id" | "projectId" | "source" | "catalogVersion"> {
  return {
    name,
    grade,
    fy_MPa,
    fu_MPa,
    E_MPa,
    poisson,
    density_kgpm3,
  };
}
