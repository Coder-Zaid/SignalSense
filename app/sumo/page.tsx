'use client';

import { SumoViewer } from '@/components/sumo/SumoViewer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SUMOSimulationPage() {
  return (
    <div className="container mx-auto py-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>SUMO Traffic Simulation</CardTitle>
          <CardDescription>
            Realistic traffic simulation powered by SUMO (Simulation of Urban MObility)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <SumoViewer width={1000} height={700} />
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-800 mb-2">How to Use</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-blue-700">
                <li>Click the <strong>Start</strong> button to begin the simulation</li>
                <li>Use the slider to adjust the simulation speed</li>
                <li>Watch as vehicles follow traffic rules and signals</li>
                <li>Emergency vehicles will have priority at intersections</li>
              </ol>
            </div>
            
            <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
              <h3 className="font-medium text-yellow-800 mb-2">Note</h3>
              <p className="text-sm text-yellow-700">
                Make sure the SUMO simulation server is running. The simulation may take a moment to load.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
