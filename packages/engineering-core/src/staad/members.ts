import { CanonicalProject, Member } from "../types.js";
import { StaadContext } from "./types.js";

export function serializeMembers(project: CanonicalProject, ctx: StaadContext) {
  const membersToExport = project.structuralModel.members.filter(m => shouldExportMember(m, project));
  if (membersToExport.length === 0) return;

  // MEMBER INCIDENCES
  ctx.lines.push("MEMBER INCIDENCES");
  
  // Sort members by canonical ID to ensure determinism
  const sortedMembers = [...membersToExport].sort((a, b) => a.id.localeCompare(b.id));

  for (const member of sortedMembers) {
    const staadId = ctx.nextMemberId++;
    ctx.memberMap.set(member.id, staadId);
    
    const startNode = ctx.nodeMap.get(member.startNodeId);
    const endNode = ctx.nodeMap.get(member.endNodeId);
    
    if (!startNode || !endNode) {
      ctx.errors.push(`Member ${member.id} references unknown nodes.`);
      continue;
    }
    
    ctx.lines.push(`${staadId} ${startNode} ${endNode}`);
  }

  // MEMBER RELEASE
  const releaseLines: string[] = [];
  for (const member of sortedMembers) {
    const staadId = ctx.memberMap.get(member.id);
    if (!staadId) continue;
    
    // Find canonical release object for this member
    const release = project.structuralModel.releases.find(r => r.memberId === member.id);
    if (!release) continue;

    // We only support rotational releases typically in PEB (Mx, My, Mz) for preliminary, 
    // unless translational releases are explicitly requested which STAAD supports via Fx, Fy, Fz
    const startStr = getReleaseString(release.startFx, release.startFy, release.startFz, release.startMx, release.startMy, release.startMz);
    if (startStr) {
      releaseLines.push(`MEMBER RELEASE\n${staadId} START ${startStr}`);
    }
    
    const endStr = getReleaseString(release.endFx, release.endFy, release.endFz, release.endMx, release.endMy, release.endMz);
    if (endStr) {
      releaseLines.push(`MEMBER RELEASE\n${staadId} END ${endStr}`);
    }
  }

  if (releaseLines.length > 0) {
    ctx.lines.push(...releaseLines);
  }
}

function shouldExportMember(m: Member, project: CanonicalProject): boolean {
  // If Crane is OFF, do not export crane runway / crane supports
  if (m.type === "CRANE_RUNWAY" || m.type === "CRANE_COLUMN") {
    if (!project.geometry.craneConfig?.craneEnabled) {
      return false;
    }
  }
  return true;
}

function getReleaseString(fx: boolean, fy: boolean, fz: boolean, mx: boolean, my: boolean, mz: boolean): string {
  const parts: string[] = [];
  if (fx) parts.push("FX");
  if (fy) parts.push("FY");
  if (fz) parts.push("FZ");
  if (mx) parts.push("MX");
  if (my) parts.push("MY");
  if (mz) parts.push("MZ");
  return parts.join(" ");
}
