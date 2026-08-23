import { Member, Section, LoadCase } from "../types";
import { createId } from "../ids";

/**
 * Calculates self-weight line load (kN/m) for a member based on its actual section mass.
 * @param member The structural member
 * @param sections Array of sections to look up mass
 */
export function calculateSelfWeight(
  member: Member,
  sections: Section[]
): number {
  if (member.unitMass_kgpm !== undefined) {
    return (member.unitMass_kgpm * 9.81) / 1000;
  }
  if (!member.sectionId) {
    return 0; // Not available yet
  }
  const section = sections.find((s) => s.id === member.sectionId);
  if (!section || !section.unitMass_kgpm) {
    return 0;
  }
  return (section.unitMass_kgpm * 9.81) / 1000; // kN/m
}

export function generateDeadLoadCase(
  projectId: string,
  designBasisId: string,
  members: Member[],
  sections: Section[]
): LoadCase {
  const loadCaseId = createId();

  const applications: any[] = [];

  for (const member of members) {
    const sw_kNpm = calculateSelfWeight(member, sections);
    if (sw_kNpm > 0) {
      applications.push({
        id: createId(),
        loadCaseId,
        targetType: "MEMBER",
        targetId: member.id,
        magnitude: -sw_kNpm, // Gravity is negative Y
        direction: "GY",
        units: "kN/m",
        source: "Calculated structural self-weight based on member section",
        designBasisRef: "IS 875 Part 1",
        description: `Self weight for ${member.label}`,
      });
    }
  }

  return {
    id: loadCaseId,
    projectId,
    type: "DEAD",
    description: "Structural Self Weight",
    source: "Auto-generated self weight from structural members",
    designBasisId,
    status: "VALIDATED_INTERNAL",
    applications,
  };
}
