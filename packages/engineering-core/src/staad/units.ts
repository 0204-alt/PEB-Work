import { StaadContext } from "./types.js";

/**
 * Standardizes units to METER KN for STAAD output.
 * Internal project convention:
 * - Coordinates: meters
 * - Section dimensions: mm
 * - Forces: kN
 * - Moments: kNm
 * - Density: kg/m3 (needs conversion to kN/m3 for STAAD if input directly)
 */
export function setStaadUnits(ctx: StaadContext) {
  ctx.lines.push("UNIT METER KN");
}

export function formatCoord(val_m: number): string {
  return val_m.toFixed(4);
}

export function mmToMeters(val_mm: number): number {
  return val_mm / 1000.0;
}

export function kgpm3ToKNpm3(val_kgpm3: number): number {
  return (val_kgpm3 * 9.80665) / 1000.0;
}
