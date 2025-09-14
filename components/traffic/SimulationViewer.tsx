'use client';

import { useEffect, useState } from 'react';

export default function SimulationViewer() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <div style={{ width: '100%', height: '100vh' }} />;
  }

  return (
    <div style={{ width: '100%', height: '100vh', overflow: 'hidden' }}>
      <iframe
        src="/traffic_simulation_turning.html"
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
        }}
        title="Traffic Simulation"
      />
    </div>
  );
}
