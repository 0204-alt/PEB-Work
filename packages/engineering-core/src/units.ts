export const UNITS = {
  length: "m",
  force: "kN",
  moment: "kNm",
  pressure: "kN/m2",
  mass: "kg",
  unitMass: "kg/m",
  area: "m2",
  windSpeed: "m/s",
} as const;

export type LengthM = number;
export type ForceKN = number;
export type MassKg = number;
