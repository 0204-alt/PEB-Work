import { useState, useEffect } from "react";
import { type CanonicalProject, type Connection, type ConnectionComponent } from "@peb/engineering-core";
import { API_BASE_URL } from "./config.js";

export function ConnectionsView() {
  const [project, setProject] = useState<CanonicalProject | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProject = async () => {
    const projectId = prompt("Enter Project ID for Connections:");
    if (!projectId) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/projects/${projectId}`);
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to fetch project");
      }
      setProject(json.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading connections...</div>;

  return (
    <section>
      <h2>Phase 9: Connections &amp; Base Plates</h2>
      <button onClick={fetchProject}>Fetch Project Connections</button>
      {error && <p style={{ color: "red" }}>{error}</p>}
      
      {project && (
        <div style={{ marginTop: 20 }}>
          <h3>Connection Summary</h3>
          <p>
            <strong>Total Identified Connections:</strong> {project.connections?.length || 0}
          </p>
          <div className="warning">
            <strong>Design Status:</strong> REQUIRES_ENGINEERING_REVIEW 
            (Global analysis demands are deferred until Phase 10)
          </div>
          <p>
            <em>Note: Connections are IDENTIFIED, but components are NOT_YET_DEFINED unless explicitly provided. No placeholder components are fabricated.</em>
          </p>
          <table border={1} cellPadding={8} style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead>
              <tr>
                <th>Type</th>
                <th>Status</th>
                <th>Node ID</th>
                <th>Connected Members</th>
                <th>Components (Verified / Preliminary)</th>
              </tr>
            </thead>
            <tbody>
              {project.connections?.map((conn: Connection) => {
                const verifiedQty = conn.components?.filter((c: ConnectionComponent) => c.status === "VERIFIED").length || 0;
                const prelimQty = conn.components?.filter((c: ConnectionComponent) => c.status === "PRELIMINARY").length || 0;
                return (
                  <tr key={conn.id}>
                    <td>{conn.type}</td>
                    <td>
                      {conn.status}
                      {conn.status === "REQUIRES_ENGINEERING_REVIEW" && (
                        <div style={{fontSize: '0.8em', color: 'orange'}}>Missing demand/methodology</div>
                      )}
                    </td>
                    <td style={{fontSize: '0.8em'}}>{conn.nodeId || "N/A"}</td>
                    <td>{conn.sourceMemberIds?.length || 0} members</td>
                    <td>
                      {conn.components?.length === 0 ? (
                        "NOT_YET_DEFINED"
                      ) : (
                        <span>Verified: {verifiedQty}, Preliminary: {prelimQty}</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
