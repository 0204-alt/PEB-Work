import { useState } from "react";

export function CraneView() {
  const [craneEnabled, setCraneEnabled] = useState(true);
  
  return (
    <section>
      <h2>Phase 8: Crane System</h2>
      
      <div style={{ marginBottom: 15 }}>
        <label>
          <input 
            type="checkbox" 
            checked={craneEnabled} 
            onChange={(e) => setCraneEnabled(e.target.checked)} 
          />
          Enable Crane System
        </label>
      </div>

      {craneEnabled && (
        <div style={{ border: '1px solid #ccc', padding: 15 }}>
          <h3>Crane Configuration</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 15 }}>
            <div>
              <label>Capacity (t): </label>
              <input type="number" defaultValue={5} />
            </div>
            <div>
              <label>Runway Elevation (m): </label>
              <input type="number" defaultValue={5.0} />
            </div>
            <div>
              <label>Self Weight (kN): </label>
              <input type="number" defaultValue={40} />
            </div>
            <div>
              <label>Trolley Weight (kN): </label>
              <input type="number" defaultValue={5} />
            </div>
          </div>
          
          <h4>Verified Methodologies</h4>
          <p style={{ fontSize: '0.9em', color: '#555' }}>
            To satisfy Phase 8 requirements, methodologies must be verified. 
            Missing info yields REQUIRES_ENGINEERING_REVIEW.
          </p>
          <table border={1} cellPadding={5} style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead>
              <tr>
                <th>Force Direction</th>
                <th>Source</th>
                <th>Standard</th>
                <th>Verified</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Vertical Impact</td>
                <td>Client Specification</td>
                <td>IS 875</td>
                <td><input type="checkbox" defaultChecked={true} /></td>
              </tr>
              <tr>
                <td>Transverse</td>
                <td>Client Specification</td>
                <td>IS 875</td>
                <td><input type="checkbox" defaultChecked={false} /></td>
              </tr>
              <tr>
                <td>Longitudinal</td>
                <td>Client Specification</td>
                <td>IS 875</td>
                <td><input type="checkbox" defaultChecked={false} /></td>
              </tr>
            </tbody>
          </table>
          
          <p className="disclaimer" style={{ marginTop: 15 }}>
            Note: Crane equipment weight is correctly excluded from building structural steel mass. 
            Runway brackets and beams are included in steel mass but defer global analysis to Phase 10.
          </p>
        </div>
      )}
    </section>
  );
}
