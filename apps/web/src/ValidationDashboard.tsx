import { useState } from "react";

export function ValidationDashboard() {
  const [projectId, setProjectId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [validationRun, setValidationRun] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchValidation = async () => {
    if (!projectId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`http://localhost:3000/api/v1/projects/${projectId}/validation`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch validation");
      setValidationRun(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const triggerValidation = async () => {
    if (!projectId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`http://localhost:3000/api/v1/projects/${projectId}/validation`, {
        method: "POST"
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to trigger validation");
      setValidationRun(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderBadge = (status: string) => {
    let color = "#666";
    switch (status) {
      case "READY":
      case "PASS":
        color = "#2e7d32";
        break;
      case "PARTIALLY_READY":
      case "WARNING":
      case "INFO":
        color = "#ed6c02";
        break;
      case "BLOCKED":
      case "NOT_AVAILABLE":
      case "ERROR":
      case "UNSUPPORTED":
        color = "#d32f2f";
        break;
      case "REQUIRES_ENGINEERING_REVIEW":
        color = "#9c27b0";
        break;
      case "NOT_YET_DEFINED":
        color = "#0288d1";
        break;
    }

    return (
      <span style={{
        display: "inline-block",
        padding: "2px 8px",
        borderRadius: "4px",
        backgroundColor: color,
        color: "white",
        fontSize: "0.85em",
        fontWeight: "bold",
      }}>
        {status}
      </span>
    );
  };

  return (
    <section>
      <h2>Phase 12: Validation Engine</h2>
      <div style={{ marginBottom: 16 }}>
        <input 
          type="text" 
          placeholder="Enter Project ID" 
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          style={{ padding: "8px", marginRight: "8px", width: "300px" }}
        />
        <button onClick={fetchValidation} disabled={loading || !projectId}>
          {loading ? "Loading..." : "Get Latest"}
        </button>
        <button onClick={triggerValidation} disabled={loading || !projectId} style={{ marginLeft: "8px" }}>
          Run Validation
        </button>
      </div>

      {error && <div style={{ color: "red", marginBottom: 16 }}>Error: {error}</div>}

      {validationRun && (
        <div style={{ border: "1px solid #ccc", padding: "16px", borderRadius: "8px" }}>
          <h3>Validation Run Summary</h3>
          <p><strong>Export Blocked:</strong> {validationRun.exportBlocked ? "Yes" : "No"}</p>
          <p><strong>Created At:</strong> {new Date(validationRun.createdAt).toLocaleString()}</p>

          {validationRun.gates && (
            <div style={{ marginTop: 16 }}>
              <h4>Operation Gates</h4>
              <table border={1} cellPadding={8} style={{ borderCollapse: 'collapse', width: '100%', marginBottom: 16 }}>
                <thead>
                  <tr>
                    <th>Operation</th>
                    <th>Readiness</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(validationRun.gates).map(([op, status]) => (
                    <tr key={op}>
                      <td><strong>{op}</strong></td>
                      <td>{renderBadge(status as string)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <h4>Findings ({validationRun.findings?.length || 0})</h4>
          {validationRun.findings && validationRun.findings.length > 0 ? (
            <table border={1} cellPadding={8} style={{ borderCollapse: 'collapse', width: '100%' }}>
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Severity</th>
                  <th>Code</th>
                  <th>Message</th>
                  <th>Entity</th>
                </tr>
              </thead>
              <tbody>
                {validationRun.findings.map((f: any) => (
                  <tr key={f.id}>
                    <td>{f.category}</td>
                    <td>{renderBadge(f.severity)}</td>
                    <td><code>{f.code}</code></td>
                    <td>{f.message}</td>
                    <td>{f.entityType ? `${f.entityType} (${f.entityId})` : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No findings recorded.</p>
          )}
        </div>
      )}
    </section>
  );
}
