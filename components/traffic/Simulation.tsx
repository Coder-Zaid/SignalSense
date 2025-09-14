'use client';

import * as React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { TrafficAIController } from '@/lib/traffic/aiController';
import { Vehicle, TrafficLight, Intersection, Direction, SimulationState, SimulationMetrics, VehicleStatus } from './types';
import { SIMULATION_CONFIG } from '@/lib/traffic/config';

interface SimulationProps {
  type: '2lane' | '4lane';
  isRunning: boolean;
  onToggleRunning: () => void;
  onVehicleCountChange: (count: number) => void;
  onAverageWaitTimeChange: (time: number) => void;
  onTotalVehiclesChange: (count: number) => void;
  onVehiclesExitedChange: (count: number) => void;
  children?: React.ReactNode;
}

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const INTERSECTION_SIZE = 100;
const VEHICLE_SIZE = 10;

const Simulation: React.FC<SimulationProps> = ({
  type,
  isRunning,
  onToggleRunning,
  onVehicleCountChange,
  onAverageWaitTimeChange,
  onTotalVehiclesChange,
  onVehiclesExitedChange,
  children,
}: SimulationProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number | null>(null);
  const lastUpdateTime = useRef<number>(Date.now());
  
  const [simulationState, setSimulationState] = useState<SimulationState>({
    isRunning: false,
    simulationType: type,
    speed: 1.0,
    showAIControls: true,
    showStats: true,
    vehicleCount: 0,
    averageWaitTime: 0,
    totalVehicles: 0,
    vehiclesExited: 0,
    lastUpdate: Date.now(),
    intersections: [],
    vehicles: [],
    time: 0,
    metrics: {
      totalVehicles: 0,
      averageWaitTime: 0,
      totalWaitTime: 0,
      vehiclesExited: 0,
    },
  });

  const calculateMetrics = useCallback((vehicles: Vehicle[], exitedCount: number): SimulationMetrics => {
    const totalVehicles = vehicles.length;
    const totalWaitTime = vehicles.reduce((sum, vehicle) => sum + vehicle.waitTime, 0);
    const averageWaitTime = totalVehicles > 0 ? totalWaitTime / totalVehicles : 0;

    return {
      totalVehicles,
      averageWaitTime,
      totalWaitTime,
      vehiclesExited: exitedCount,
    };
  }, []);

  const updateVehicles = useCallback((vehicles: Vehicle[], intersections: Intersection[]): Vehicle[] => {
    if (!vehicles.length) return [];
    return vehicles.map((vehicle: Vehicle): Vehicle => {
      const newVehicle: Vehicle = { ...vehicle };

      // Check if vehicle is at an intersection
      const currentIntersection = intersections.find((intersection) => {
        const dx = Math.abs(vehicle.x - intersection.x);
        const dy = Math.abs(vehicle.y - intersection.y);
        return dx < 30 && dy < 30;
      });

      if (currentIntersection) {
        const trafficLight = currentIntersection.trafficLights.find(
          (light) => light.direction === vehicle.direction
        );

        if (trafficLight && trafficLight.state === 'red') {
          // Vehicle is waiting at red light
          newVehicle.waitTime += 1;
          return newVehicle;
        }
      }

      // Move vehicle based on direction
      switch (vehicle.direction) {
        case 'north':
          newVehicle.y -= vehicle.speed;
          break;
        case 'south':
          newVehicle.y += vehicle.speed;
          break;
        case 'east':
          newVehicle.x += vehicle.speed;
          break;
        case 'west':
          newVehicle.x -= vehicle.speed;
          break;
      }

      return newVehicle;
    });
  }, []);

  const filterExitedVehicles = (vehicles: Vehicle[]): { filtered: Vehicle[]; exitedCount: number } => {
    if (!vehicles || !vehicles.length) return { filtered: [], exitedCount: 0 };
    const buffer = 100;
    const filtered = vehicles.filter((vehicle) => (
      vehicle.x >= -buffer &&
      vehicle.x <= SIMULATION_CONFIG.CANVAS_WIDTH + buffer &&
      vehicle.y >= -buffer &&
      vehicle.y <= SIMULATION_CONFIG.CANVAS_HEIGHT + buffer
    ));
    return {
      filtered,
      exitedCount: vehicles.length - filtered.length,
    };
  };

  // Helper function to create traffic light with position
  const createTrafficLight = (id: string, state: 'red' | 'green' | 'yellow', direction: Direction, x: number, y: number): TrafficLight => ({
    id,
    state,
    timer: 0,
    direction,
    position: { x, y },
  });

  // Initialize simulation
  useEffect((): () => void => {
    // Create intersections based on simulation type
    const intersections: Intersection[] = [];
    const centerX = SIMULATION_CONFIG.CANVAS_WIDTH / 2;
    const centerY = SIMULATION_CONFIG.CANVAS_HEIGHT / 2;

    if (type === '4lane') {
      // Create a 4-way intersection
      intersections.push({
        id: 'intersection-1',
        x: centerX,
        y: centerY,
        trafficLights: [
          createTrafficLight('north', 'red', 'north', centerX - 15, centerY - 50),
          createTrafficLight('east', 'green', 'east', centerX + 20, centerY - 15),
          createTrafficLight('south', 'red', 'south', centerX - 15, centerY + 20),
          createTrafficLight('west', 'red', 'west', centerX - 50, centerY - 15),
        ],
        vehicles: [], // Initialize empty vehicles array
      });
    } else {
      // Create a 2-way intersection (north-south)
      intersections.push({
        id: 'intersection-1',
        x: centerX,
        y: centerY,
        trafficLights: [
          createTrafficLight('north', 'red', 'north', centerX - 15, centerY - 50),
          createTrafficLight('south', 'green', 'south', centerX - 15, centerY + 20),
        ],
        vehicles: [], // Initialize empty vehicles array
      });
    }

    setSimulationState({
      isRunning: false,
      simulationType: type,
      speed: 1.0,
      showAIControls: true,
      showStats: true,
      vehicleCount: 0,
      averageWaitTime: 0,
      totalVehicles: 0,
      vehiclesExited: 0,
      lastUpdate: Date.now(),
      intersections,
      vehicles: [],
      time: 0,
      metrics: {
        totalVehicles: 0,
        averageWaitTime: 0,
        totalWaitTime: 0,
        vehiclesExited: 0,
      }
    });

    // Reset metrics
    onVehicleCountChange(0);
    onAverageWaitTimeChange(0);
    onTotalVehiclesChange(0);
    onVehiclesExitedChange(0);

    // Cleanup on unmount
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = null;
      }
    };
  }, [
    type,
    onVehicleCountChange,
    onAverageWaitTimeChange,
    onTotalVehiclesChange,
    onVehiclesExitedChange,
  ]);

  useEffect(() => {
    onVehicleCountChange(simulationState.metrics.totalVehicles);
    onAverageWaitTimeChange(simulationState.metrics.averageWaitTime);
    onTotalVehiclesChange(simulationState.metrics.vehiclesExited + simulationState.metrics.totalVehicles);
    onVehiclesExitedChange(simulationState.metrics.vehiclesExited);
  }, [
    simulationState.metrics,
    onVehicleCountChange,
    onAverageWaitTimeChange,
    onTotalVehiclesChange,
    onVehiclesExitedChange,
  ]);

  // Game loop
  const gameLoop = useCallback((timestamp: number): void => {
    if (!isRunning) return;

    const deltaTime = timestamp - (lastUpdateTime.current || 0);
    lastUpdateTime.current = timestamp;
    
    if (!canvasRef.current) return;

    // Update simulation state
    setSimulationState((prevState: SimulationState): SimulationState => {
      // Update vehicle positions
      const updatedVehicles = updateVehicles(prevState.vehicles, prevState.intersections);

      // Filter out vehicles that have exited the canvas
      const { filtered: filteredVehicles, exitedCount } = filterExitedVehicles(updatedVehicles);

      // Spawn new vehicles randomly
      const newVehicles = [...filteredVehicles];
      if (Math.random() > 0.95) { // 5% chance to spawn a new vehicle each frame
        const directions: Direction[] = type === '4lane' 
          ? ['north', 'south', 'east', 'west'] 
          : ['north', 'south'];
        const direction = directions[Math.floor(Math.random() * directions.length)];
        const newVehicle = spawnVehicle(direction);
        if (newVehicle) {
          newVehicles.push(newVehicle);
        }
      }

      // Calculate metrics
      const vehicleCount = newVehicles.length;
      const vehiclesExited = (prevState.metrics.vehiclesExited || 0) + exitedCount;
      const totalVehicles = vehicleCount + vehiclesExited;
      const averageWaitTime = newVehicles.length > 0
        ? newVehicles.reduce((sum, v) => sum + (v.waitTime || 0), 0) / newVehicles.length
        : 0;

      // Update parent component with metrics
      onVehicleCountChange(vehicleCount);
      onAverageWaitTimeChange(averageWaitTime);
      onTotalVehiclesChange(totalVehicles);
      onVehiclesExitedChange(vehiclesExited);

      return {
        ...prevState,
        vehicles: newVehicles,
        intersections: prevState.intersections, // Keep existing intersections
        metrics: {
          totalVehicles,
          averageWaitTime,
          totalWaitTime: prevState.metrics.totalWaitTime + exitedCount,
          vehiclesExited,
        },
      };
    });

    // Draw the scene
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      // Clear canvas
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Draw roads
      ctx.fillStyle = '#333';
      // Horizontal road
      ctx.fillRect(0, CANVAS_HEIGHT / 2 - 30, CANVAS_WIDTH, 60);
      // Vertical road
      ctx.fillRect(CANVAS_WIDTH / 2 - 30, 0, 60, CANVAS_HEIGHT);

      // Draw intersection
      ctx.fillStyle = '#444';
      ctx.fillRect(
        CANVAS_WIDTH / 2 - INTERSECTION_SIZE / 2,
        CANVAS_HEIGHT / 2 - INTERSECTION_SIZE / 2,
        INTERSECTION_SIZE,
        INTERSECTION_SIZE
      );

      // Draw traffic lights
      simulationState.intersections.forEach((intersection: Intersection) => {
        // Draw intersection area
        ctx.fillStyle = '#444';
        ctx.fillRect(
          intersection.x - INTERSECTION_SIZE / 2,
          intersection.y - INTERSECTION_SIZE / 2,
          INTERSECTION_SIZE,
          INTERSECTION_SIZE
        );

        // Draw traffic lights
        intersection.trafficLights.forEach((light: TrafficLight) => {
          // Draw light base
          ctx.fillStyle = '#222';
          ctx.fillRect(light.position.x, light.position.y, 20, 40);

          // Draw lights
          const colors = ['red', 'yellow', 'green'] as const;
          colors.forEach((color: 'red' | 'yellow' | 'green', i: number) => {
            ctx.beginPath();
            ctx.arc(
              light.position.x + 10,
              light.position.y + 10 + i * 10,
              5,
              0,
              Math.PI * 2
            );
            ctx.fillStyle = light.state === color ? color : '#444';
            ctx.fill();
          });
        });
      });

      // Draw vehicles
      const drawVehicle = (ctx: CanvasRenderingContext2D, vehicle: Vehicle): void => {
        ctx.save();
        ctx.translate(vehicle.x, vehicle.y);
        
        // Rotate based on direction
        let angle = 0;
        switch (vehicle.direction) {
          case 'north': angle = -Math.PI / 2; break;
          case 'south': angle = Math.PI / 2; break;
          case 'east': angle = 0; break;
          case 'west': angle = Math.PI; break;
        }
        ctx.rotate(angle);
        
        // Draw vehicle body
        ctx.fillStyle = vehicle.color;
        ctx.fillRect(
          -vehicle.width / 2,
          -vehicle.height / 2,
          vehicle.width,
          vehicle.height
        );
        
        // Add some details
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fillRect(
          -vehicle.width / 4,
          -vehicle.height / 2,
          vehicle.width / 2,
          vehicle.height
        );
        
        ctx.restore();
      };

      simulationState.vehicles.forEach((vehicle: Vehicle) => {
        drawVehicle(ctx, vehicle);
      });
    }

    // Continue the loop
    animationFrameId.current = requestAnimationFrame(gameLoop);
  }, [
    isRunning,
    onVehicleCountChange,
    onAverageWaitTimeChange,
    onTotalVehiclesChange,
    onVehiclesExitedChange,
  ]);

  useEffect(() => {
    if (!canvasRef.current) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    gameLoop(Date.now());
  }, [gameLoop]);

  const spawnVehicle = useCallback((direction: Direction): Vehicle | null => {
    // Only spawn new vehicles if simulation is running
    if (!isRunning) return null;
    
    // Update metrics when a new vehicle is spawned
    setSimulationState((prevState: SimulationState) => ({
      ...prevState,
      metrics: {
        ...prevState.metrics,
        totalVehicles: prevState.metrics.totalVehicles + 1
      }
    }));
    let x = 0;
    let y = 0;

    switch (direction) {
      case 'north':
        x = Math.random() * CANVAS_WIDTH;
        y = CANVAS_HEIGHT + 50;
        break;
      case 'south':
        x = Math.random() * CANVAS_WIDTH;
        y = -50;
        break;
      case 'east':
        x = -50;
        y = Math.random() * CANVAS_HEIGHT;
        break;
      case 'west':
        x = CANVAS_WIDTH + 50;
        y = Math.random() * CANVAS_HEIGHT;
        break;
    }

    return {
      id: `vehicle-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      x,
      y,
      width: 20,
      height: 10,
      speed: 2 + Math.random(),
      direction,
      color: `hsl(${Math.random() * 360}, 70%, 50%)`,
      status: 'moving',
      waitTime: 0,
      hasWaited: false,
    };
  }, []);

  const updateTrafficLights = useCallback((intersections: Intersection[], vehicles: Vehicle[]): Intersection[] => {
    if (!intersections || !vehicles) return [];
    
    const aiController = new TrafficAIController();
    return intersections.map((intersection: Intersection) => {
      const updatedLights = aiController.updateLights(intersection);
      return {
        ...intersection,
        trafficLights: updatedLights,
      };
    });
  }, []);

  const toggleSimulation = useCallback((): void => {
    onToggleRunning();
  }, [onToggleRunning]);

  return (
    <div className="relative">
      {children}
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="border border-gray-300 rounded-lg bg-gray-100"
      />
      <div className="absolute top-4 right-4 bg-white p-4 rounded-lg shadow-lg">
        <h3 className="font-bold mb-2">Simulation Metrics</h3>
        <p>Total Vehicles: {simulationState.metrics.totalVehicles}</p>
        <p>Average Wait Time: {simulationState.metrics.averageWaitTime.toFixed(1)}s</p>
        <p>Vehicles Exited: {simulationState.metrics.vehiclesExited}</p>
      </div>
      <button onClick={toggleSimulation} className="absolute top-4 left-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        Toggle Simulation
      </button>
    </div>
  );
};

// Helper functions
function updateVehicles(
  vehicles: Vehicle[],
  lights: TrafficLight[],
  deltaTime: number,
  metrics: SimulationState['metrics']
) {
  const updatedVehicles = [...vehicles];
  const vehiclesToRemove: number[] = [];

  updatedVehicles.forEach((vehicle, index) => {
    const light = lights.find(l => l.direction === vehicle.direction);
    const canMove = !light || light.state === 'green';

    // Update position
    if (canMove) {
      switch (vehicle.direction) {
        case 'north':
          vehicle.y -= vehicle.speed * deltaTime * 60;
          break;
        case 'south':
          vehicle.y += vehicle.speed * deltaTime * 60;
          break;
        case 'east':
          vehicle.x += vehicle.speed * deltaTime * 60;
          break;
        case 'west':
          vehicle.x -= vehicle.speed * deltaTime * 60;
          break;
      }
      vehicle.status = 'moving';
    } else {
      vehicle.waitTime += deltaTime;
      vehicle.status = 'waiting';
    }

    // Check if vehicle exited the screen
    if (
      vehicle.x < 0 ||
      vehicle.x > CANVAS_WIDTH ||
      vehicle.y < 0 ||
      vehicle.y > CANVAS_HEIGHT
    ) {
      vehiclesToRemove.push(index);
      metrics.vehiclesExited += 1;
      metrics.totalWaitTime += vehicle.waitTime;
    }
  });

  // Remove vehicles that exited
  for (let i = vehiclesToRemove.length - 1; i >= 0; i--) {
    updatedVehicles.splice(vehiclesToRemove[i], 1);
  }

  return { vehicles: updatedVehicles };
}

function updateMetrics(
  metrics: SimulationState['metrics'],
  vehicles: Vehicle[],
  deltaTime: number
) {
  const waitingVehicles = vehicles.filter(v => v.status === 'waiting').length;
  const newMetrics = { ...metrics };
  
  if (waitingVehicles > 0) {
    newMetrics.totalWaitTime += waitingVehicles * deltaTime;
    newMetrics.averageWaitTime = newMetrics.totalWaitTime / newMetrics.vehiclesExited || 0;
  }
  
  return newMetrics;
}


function getVehicleColor(vehicle: Vehicle): string {
  switch (vehicle.status) {
    case 'waiting':
      return '#ff4444'; // Red for waiting
    case 'moving':
      return '#44ff44'; // Green for moving
    default:
      return '#4444ff'; // Blue for other states
  }
}

// Export as a named export
export { Simulation };
