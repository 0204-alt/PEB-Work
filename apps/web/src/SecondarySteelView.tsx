import { useState } from "react";

export function SecondarySteelView() {
  const [loading, setLoading] = useState(false);
  const [designRun, setDesignRun] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDesignSecondary = async () => {
    const projectId = prompt("Enter Project ID to run preliminary design:");
    if (!projectId) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`http://localhost:3000/api/v1/projects/${projectId}/design/execute`, {
        method: "POST",
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to execute design run");
      }
      
      const res2 = await fetch(`http://localhost:3000/api/v1/projects/${projectId}/design/results`);
      const json2 = await res2.json();
      if (json2.data) {
        setDesignRun(json2.data);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!designRun) {
    return (
      <section>
        <h2>Phase 6 & 7: Secondary Steel & Bracing Design</h2>
        <p>Run design engine for bracing, secondary and primary steel members.</p>
        <button onClick={handleDesignSecondary} disabled={loading}>
          {loading ? "Designing..." : "Run Preliminary Design"}
        </button>
        {error && <p style={{ color: "red", marginTop: 10 }}>Error: {error}</p>}
      </section>
    );
  }

  const secondaryMembers = designRun.memberResults.filter((r: any) => 
    ["PURLIN", "GIRT", "EAVE_STRUT", "END_WALL_SECONDARY", "SAG_ROD", "ROOF_BRACING", "WALL_BRACING"].includes(r.member?.type)
  );
  
  const primaryMembers = designRun.memberResults.filter((r: any) => 
    !["PURLIN", "GIRT", "EAVE_STRUT", "END_WALL_SECONDARY", "SAG_ROD", "ROOF_BRACING", "WALL_BRACING"].includes(r.member?.type)
  );

  return (
    <section>
      <h2>Phase 6 & 7: Secondary Steel & Bracing Design</h2>
      <button onClick={handleDesignSecondary} disabled={loading}>
          {loading ? "Designing..." : "Re-run Design"}
      </button>
      {error && <p style={{ color: "red", marginTop: 10 }}>Error: {error}</p>}
      
      <div style={{ marginTop: 20 }}>
        <h3>Design Run Results (ID: {designRun.id.substring(0,8)})</h3>
        <p>Status: {designRun.status}</p>
        
        <h4>Secondary Members ({secondaryMembers.length})</h4>
        {secondaryMembers.length > 0 ? (
          <table border={1} cellPadding={8} style={{ borderCollapse: 'collapse', width: '100%', fontSize: '0.9em' }}>
            <thead>
              <tr>
                <th>Member Label</th>
                <th>Type</th>
                <th>Status</th>
                <th>Selected Section</th>
                <th>Material</th>
                <th>Gov. Check</th>
                <th>Util.</th>
                <th>Warnings</th>
              </tr>
            </thead>
            <tbody>
              {secondaryMembers.map((r: any) => (
                <tr key={r.id} style={{ backgroundColor: r.status === 'REQUIRES_ENGINEERING_REVIEW' ? '#fff3cd' : r.status === 'PASS' ? '#d4edda' : '#f8d7da' }}>
                  <td>{r.member?.label}</td>
                  <td>{r.member?.type}</td>
                  <td>{r.status}</td>
                  <td>{r.section?.designation || "-"}</td>
                  <td>{r.material?.name || "-"}</td>
                  <td>{r.governingLoadCaseId || "N/A"}</td>
                  <td>{r.utilization > 0 ? r.utilization.toFixed(2) : "-"}</td>
                  <td>{JSON.stringify(r.warnings)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No secondary members designed.</p>
        )}
        
        <h4>Primary Members ({primaryMembers.length})</h4>
        {primaryMembers.length > 0 ? (
          <table border={1} cellPadding={8} style={{ borderCollapse: 'collapse', width: '100%', fontSize: '0.9em' }}>
            <thead>
              <tr>
                <th>Member Label</th>
                <th>Type</th>
                <th>Status</th>
                <th>Selected Section</th>
                <th>Util.</th>
              </tr>
            </thead>
            <tbody>
              {primaryMembers.map((r: any) => (
                <tr key={r.id}>
                  <td>{r.member?.label}</td>
                  <td>{r.member?.type}</td>
                  <td>{r.status}</td>
                  <td>{r.section?.designation || "-"}</td>
                  <td>{r.utilization > 0 ? r.utilization.toFixed(2) : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No primary members designed.</p>
        )}
      </div>
    </section>
  );
}
