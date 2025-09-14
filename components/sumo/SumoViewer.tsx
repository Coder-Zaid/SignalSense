import React, { useRef, useEffect } from 'react';
import { useSumoSimulation } from '@/hooks/useSumoSimulation';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause } from 'lucide-react';

interface SumoViewerProps {
  width?: number;
  height?: number;
}

export function SumoViewer({ width = 800, height = 600 }: SumoViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const {
    isConnected,
    isRunning,
    simulationData,
    startSimulation,
    stopSimulation,
    setSimulationSpeed,
  } = useSumoSimulation();

  // Draw the simulation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !simulationData) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw background
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, width, height);

    // Draw roads
    ctx.strokeStyle = '#666666';
    ctx.lineWidth = 50;
    
    // Main roads
    ctx.beginPath();
    // Horizontal road
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    // Vertical road
    ctx.moveTo(width / 2, 0);
    ctx.lineTo(width / 2, height);
    ctx.stroke();

    // Draw vehicles
    Object.values(simulationData.vehicles).forEach(vehicle => {
      const x = (vehicle.x / 500) * width;
      const y = (vehicle.y / 500) * height;
      
      // Skip if vehicle is outside view
      if (x < 0 || x > width || y < 0 || y > height) return;

      // Set color based on vehicle type
      switch (vehicle.type) {
        case 'bus':
          ctx.fillStyle = '#ff9900';
          break;
        case 'bike':
          ctx.fillStyle = '#00cc00';
          break;
        case 'emergency':
          ctx.fillStyle = '#ff0000';
          break;
        default:
          ctx.fillStyle = '#3366cc';
      }

      // Draw vehicle
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((vehicle.angle * Math.PI) / 180);
      
      // Different sizes for different vehicle types
      let vehicleWidth = 10;
      let vehicleHeight = 5;
      
      if (vehicle.type === 'bus') {
        vehicleWidth = 14;
        vehicleHeight = 7;
      } else if (vehicle.type === 'bike') {
        vehicleWidth = 6;
        vehicleHeight = 3;
      } else if (vehicle.type === 'emergency') {
        vehicleWidth = 12;
        vehicleHeight = 6;
      }
      
      ctx.fillRect(-vehicleWidth / 2, -vehicleHeight / 2, vehicleWidth, vehicleHeight);
      
      // Add label for emergency vehicles
      if (vehicle.type === 'emergency') {
        ctx.fillStyle = '#000000';
        ctx.font = '8px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('EMS', 0, -vehicleHeight);
      }
      
      ctx.restore();
    });

    // Draw traffic lights
    Object.entries(simulationData.trafficLights).forEach(([id, light]) => {
      let x, y;
      
      // Position traffic lights at the edges of the intersection
      switch (id) {
        case 'north':
          x = width / 2;
          y = height / 2 - 30;
          break;
        case 'south':
          x = width / 2;
          y = height / 2 + 30;
          break;
        case 'east':
          x = width / 2 + 30;
          y = height / 2;
          break;
        case 'west':
          x = width / 2 - 30;
          y = height / 2;
          break;
        default:
          return;
      }
      
      // Draw traffic light
      ctx.fillStyle = '#333333';
      ctx.fillRect(x - 5, y - 15, 10, 30);
      
      // Draw lights
      const lightStates = light.state.split('');
      lightStates.forEach((state, i) => {
        switch (state) {
          case 'r':
            ctx.fillStyle = '#ff0000';
            break;
          case 'y':
            ctx.fillStyle = '#ffff00';
            break;
          case 'g':
            ctx.fillStyle = '#00ff00';
            break;
          default:
            ctx.fillStyle = '#555555';
        }
        
        ctx.beginPath();
        ctx.arc(x, y - 10 + i * 10, 3, 0, Math.PI * 2);
        ctx.fill();
      });
    });
    
  }, [simulationData, width, height]);

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center" style={{ width, height }}>
        <div className="text-center">
          <p className="text-lg font-medium mb-2">SUMO Simulation</p>
          <p className="text-sm text-gray-600">
            {isConnected ? 'Connected' : 'Connecting to simulation server...'}
          </p>
          <p className="text-xs text-gray-500 mt-4">
            Make sure the SUMO simulation server is running
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden" style={{ width }}>
      <div className="bg-gray-100 p-2 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Button 
            onClick={isRunning ? stopSimulation : startSimulation}
            size="sm"
            variant={isRunning ? "outline" : "default"}
          >
            {isRunning ? (
              <>
                <Pause className="h-4 w-4 mr-1" />
                Pause
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-1" />
                Start
              </>
            )}
          </Button>
          
          <div className="flex items-center space-x-2 ml-4">
            <span className="text-xs text-gray-600">Speed:</span>
            <Slider
              defaultValue={[1]}
              min={0.1}
              max={5}
              step={0.1}
              className="w-32"
              onValueChange={([value]) => setSimulationSpeed(value)}
            />
          </div>
        </div>
        
        <div className="text-xs text-gray-600">
          {simulationData ? `Time: ${simulationData.time.toFixed(1)}s` : 'Ready'}
        </div>
      </div>
      
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="bg-white"
      />
      
      <div className="bg-gray-50 p-2 text-xs text-gray-600 border-t">
        <div className="flex justify-between">
          <div>Vehicles: {simulationData ? Object.keys(simulationData.vehicles).length : 0}</div>
          <div className="flex space-x-4">
            <span>🚗 Car</span>
            <span>🚌 Bus</span>
            <span>🚲 Bike</span>
            <span className="text-red-600">🚑 Emergency</span>
          </div>
        </div>
      </div>
    </div>
  );
}
