import { LoadCase, LoadCombination } from "../types";
import { createId } from "../ids";

export function generateCombinations(
  projectId: string,
  loadCases: LoadCase[]
): LoadCombination[] {
  const combinations: LoadCombination[] = [];

  const deadCases = loadCases.filter((lc) => lc.type === "DEAD" || lc.type === "COLLATERAL");
  const liveCases = loadCases.filter((lc) => lc.type === "LIVE" || lc.type === "CRANE");
  const windCases = loadCases.filter((lc) => lc.type.startsWith("WIND_"));
  const upliftCases = loadCases.filter((lc) => lc.type === "UPLIFT");

  const addCombo = (label: string, category: "ULS" | "SLS", factors: { loadCaseId: string; factor: number }[]) => {
    // Only add if we actually have cases for the factors
    if (factors.length > 0) {
      combinations.push({
        id: createId(),
        projectId,
        label,
        category,
        source: "IS 800:2007 Table 4",
        status: "VALIDATED_INTERNAL",
        factors,
      });
    }
  };

  const getFactors = (cases: LoadCase[], multiplier: number) => {
    return cases.map((lc) => ({ loadCaseId: lc.id, factor: multiplier }));
  };

  // 1.5 DL + 1.5 LL (ULS)
  if (deadCases.length > 0 && liveCases.length > 0) {
    addCombo("1.5 (DL + LL)", "ULS", [
      ...getFactors(deadCases, 1.5),
      ...getFactors(liveCases, 1.5),
    ]);
  }

  // 1.5 DL + 1.5 WL (ULS) - for each wind case
  if (deadCases.length > 0) {
    for (const windCase of windCases) {
      addCombo(`1.5 (DL + WL ${windCase.type})`, "ULS", [
        ...getFactors(deadCases, 1.5),
        { loadCaseId: windCase.id, factor: 1.5 },
      ]);
    }
  }

  // 0.9 DL + 1.5 WL (ULS Uplift check)
  if (deadCases.length > 0) {
    for (const windCase of windCases) {
      addCombo(`0.9 DL + 1.5 WL ${windCase.type}`, "ULS", [
        ...getFactors(deadCases, 0.9),
        { loadCaseId: windCase.id, factor: 1.5 },
      ]);
    }
    for (const uplift of upliftCases) {
      addCombo(`0.9 DL + 1.5 WL UPLIFT`, "ULS", [
        ...getFactors(deadCases, 0.9),
        { loadCaseId: uplift.id, factor: 1.5 },
      ]);
    }
  }

  // SLS 1.0 DL + 1.0 LL
  if (deadCases.length > 0 && liveCases.length > 0) {
    addCombo("1.0 (DL + LL)", "SLS", [
      ...getFactors(deadCases, 1.0),
      ...getFactors(liveCases, 1.0),
    ]);
  }

  return combinations;
}
