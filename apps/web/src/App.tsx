import { useState } from "react";
import { SecondarySteelView } from "./SecondarySteelView";
import { CraneView } from "./CraneView";
import { ConnectionsView } from "./ConnectionsView";
import { ValidationDashboard } from "./ValidationDashboard";
import { API_BASE_URL } from "./config.js";

export function App() {
  const [loading, setLoading] = useState(false);
  const [loadResult, setLoadResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateLoads = async () => {
    // In a real app, projectId comes from URL route
    const projectId = prompt("Enter Project ID to generate loads:");
    if (!projectId) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/projects/${projectId}/loads/generate`, {
        method: "POST",
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to generate loads");
      }
      setLoadResult(json.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="shell">
      <header>
        <h1>PEB Design, Estimation &amp; STAAD Platform</h1>
        <p className="version">Application 0.1.0-phase1 — domain model only</p>
      </header>
      <section>
        <h2>Status</h2>
        <p>
          Phase 1 establishes the canonical project document, PostgreSQL schema, and
          authentication foundation. Geometry generation, loads, member design, quantity,
          and STAAD export are not implemented.
        </p>
        <p className="disclaimer">
          PRELIMINARY DESIGN / ESTIMATION — FINAL STRUCTURAL DESIGN TO BE VERIFIED BY
          QUALIFIED ENGINEER.
        </p>
      </section>
      <section>
        <h2>Coordinate system (canonical)</h2>
        <table>
          <tbody>
            <tr>
              <th>X</th>
              <td>Building length (m)</td>
            </tr>
            <tr>
              <th>Y</th>
              <td>Vertical height (m)</td>
            </tr>
            <tr>
              <th>Z</th>
              <td>Building width (m)</td>
            </tr>
          </tbody>
        </table>
      </section>
      <section>
        <h2>Quantity rule</h2>
        <p>
          Authoritative steel mass will be member quantity × length × unit mass. Benchmark
          kg/m² is comparison only and must not scale results. No engineering totals are
          shown here because they are not yet calculated.
        </p>
      </section>
      <section>
        <h2>Phase 4: Load Engine</h2>
        <p>Generate design loads based on canonical project definitions.</p>
        <button onClick={handleGenerateLoads} disabled={loading}>
          {loading ? "Generating..." : "Generate Loads"}
        </button>
        {error && <p style={{ color: "red", marginTop: 10 }}>Error: {error}</p>}
        {loadResult && (
          <div style={{ marginTop: 20 }}>
            <h3>Generated Loads</h3>
            <p><strong>Load Cases:</strong> {loadResult.loadCases?.length || 0}</p>
            <p><strong>Load Combinations:</strong> {loadResult.loadCombinations?.length || 0}</p>
            
            <h4>Cases:</h4>
            <table border={1} cellPadding={8} style={{ borderCollapse: 'collapse', width: '100%' }}>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Applications</th>
                  <th>Source</th>
                </tr>
              </thead>
              <tbody>
                {loadResult.loadCases?.map((c: any) => (
                  <tr key={c.id}>
                    <td>{c.type}</td>
                    <td>{c.description}</td>
                    <td>{c.status}</td>
                    <td>{c.applications?.length || 0}</td>
                    <td>{c.source}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      <SecondarySteelView />
      <CraneView />
      <ConnectionsView />
      <ValidationDashboard />
    </main>
  );
}
