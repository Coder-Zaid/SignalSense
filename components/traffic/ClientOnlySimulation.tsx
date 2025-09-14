'use client';

import { useEffect, useState } from 'react';

export default function ClientOnlySimulation() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
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
