import ClientOnlySimulation from '@/components/traffic/ClientOnlySimulation';

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LabPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the comparison page
    window.location.href = '/comparison.html';
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
      <p className="text-lg">Redirecting to Traffic Simulation Comparison...</p>
    </div>
  );
}
