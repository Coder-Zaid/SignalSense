import { useState, useEffect, useCallback, useRef } from 'react';
import { TrafficAIController } from '@/lib/traffic/aiController';
import { SIMULATION_CONFIG } from '@/lib/traffic/config';
import { Vehicle, TrafficLight, Intersection, SimulationState } from '@/components/traffic/types';

export function useTrafficSimulation(initialType: '2lane' | '4lane' = '4lane') {
  const [simulationState, setSimulationState] = useState<SimulationState>({
    isRunning: false,
    simulationType: initialType,
    speed: 1.0,
    showAIControls: true,
    showStats: true,
    vehicleCount: 0,
    averageWaitTime: 0,
    totalVehicles: 0,
    vehiclesExited: 0,
    intersections: [],
    vehicles: [],
    lastUpdate: Date.now(),
    time: 0,
    metrics: {
      totalVehicles: 0,
      averageWaitTime: 0,
      totalWaitTime: 0,
      vehiclesExited: 0
    }
  });

  const animationFrameId = useRef<number>();
  const aiController = useRef(new TrafficAIController());
  const lastSpawnTime = useRef<number>(0);

  // Initialize simulation
  const initializeSimulation = useCallback(() => {
    // Create intersections based on simulation type
    const intersections: Intersection[] = [];
    
    if (simulationState.simulationType === '4lane') {
      // Create a 4-way intersection
      intersections.push({
        id: 'intersection-1',
        x: SIMULATION_CONFIG.CANVAS_WIDTH / 2,
        y: SIMULATION_CONFIG.CANVAS_HEIGHT / 2,
        vehicles: [],
        trafficLights: [
          { 
            id: 'north', 
            state: 'red', 
            timer: 0, 
            direction: 'north',
            position: { x: SIMULATION_CONFIG.CANVAS_WIDTH / 2, y: SIMULATION_CONFIG.CANVAS_HEIGHT / 2 - 50 }
          },
          { 
            id: 'east', 
            state: 'green', 
            timer: 0, 
            direction: 'east',
            position: { x: SIMULATION_CONFIG.CANVAS_WIDTH / 2 + 50, y: SIMULATION_CONFIG.CANVAS_HEIGHT / 2 }
          },
          { 
            id: 'south', 
            state: 'red', 
            timer: 0, 
            direction: 'south',
            position: { x: SIMULATION_CONFIG.CANVAS_WIDTH / 2, y: SIMULATION_CONFIG.CANVAS_HEIGHT / 2 + 50 }
          },
          { 
            id: 'west', 
            state: 'red', 
            timer: 0, 
            direction: 'west',
            position: { x: SIMULATION_CONFIG.CANVAS_WIDTH / 2 - 50, y: SIMULATION_CONFIG.CANVAS_HEIGHT / 2 }
          },
        ],
      });
    } else {
      // Create a 2-way intersection
      intersections.push({
        id: 'intersection-1',
        x: SIMULATION_CONFIG.CANVAS_WIDTH / 2,
        y: SIMULATION_CONFIG.CANVAS_HEIGHT / 2,
        vehicles: [],
        trafficLights: [
          { 
            id: 'north', 
            state: 'red', 
            timer: 0, 
            direction: 'north',
            position: { x: SIMULATION_CONFIG.CANVAS_WIDTH / 2, y: SIMULATION_CONFIG.CANVAS_HEIGHT / 2 - 50 }
          },
          { 
            id: 'south', 
            state: 'green', 
            timer: 0, 
            direction: 'south',
            position: { x: SIMULATION_CONFIG.CANVAS_WIDTH / 2, y: SIMULATION_CONFIG.CANVAS_HEIGHT / 2 + 50 }
          },
        ],
      });
    }

    setSimulationState(prev => ({
      ...prev,
      intersections,
      vehicles: [],
      vehicleCount: 0,
      totalVehicles: 0,
      vehiclesExited: 0,
      averageWaitTime: 0,
    }));
  }, [simulationState.simulationType]);

  // Spawn new vehicles
  const spawnVehicles = useCallback((currentTime: number) => {
    if (currentTime - lastSpawnTime.current < 1000 / simulationState.speed) {
      return;
    }

    lastSpawnTime.current = currentTime;
    
    // Only spawn new vehicles if we're below the max count
    if (simulationState.vehicleCount >= 50) return;

    const newVehicles: Vehicle[] = [];
    const spawnChance = Math.random();
    
    if (spawnChance > 0.7) {
      // Spawn a new vehicle (30% chance per second)
      const newVehicle: Vehicle = {
        id: `vehicle-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        x: 0,
        y: 0,
        width: 20,
        height: 10,
        speed: 2,
        direction: (['north', 'south', 'east', 'west'] as const)[Math.floor(Math.random() * 4)],
        color: `hsl(${Math.random() * 360}, 70%, 50%)`,
        waitTime: 0,
        hasWaited: false,
        status: 'moving', // Add status property
      };
      
      // Position the vehicle based on its direction
      switch (newVehicle.direction) {
        case 'east':
          newVehicle.x = -20;
          newVehicle.y = SIMULATION_CONFIG.CANVAS_HEIGHT / 2 - 5;
          break;
        case 'west':
          newVehicle.x = SIMULATION_CONFIG.CANVAS_WIDTH + 20;
          newVehicle.y = SIMULATION_CONFIG.CANVAS_HEIGHT / 2 - 5;
          break;
        case 'south':
          newVehicle.x = SIMULATION_CONFIG.CANVAS_WIDTH / 2 - 5;
          newVehicle.y = -10;
          break;
        case 'north':
          newVehicle.x = SIMULATION_CONFIG.CANVAS_WIDTH / 2 - 5;
          newVehicle.y = SIMULATION_CONFIG.CANVAS_HEIGHT + 10;
          break;
      }
      
      newVehicles.push(newVehicle);
    }

    if (newVehicles.length > 0) {
      setSimulationState(prev => ({
        ...prev,
        vehicles: [...prev.vehicles, ...newVehicles],
        vehicleCount: prev.vehicleCount + newVehicles.length,
        totalVehicles: prev.totalVehicles + newVehicles.length,
      }));
    }
  }, [simulationState.vehicleCount, simulationState.speed]);

  // Update vehicle positions and handle collisions
  const updateVehicles = useCallback((deltaTime: number) => {
    setSimulationState(prev => {
      const updatedVehicles = prev.vehicles.map(vehicle => {
        // Update position based on direction and speed
        const updatedVehicle = { ...vehicle };
        
        switch (vehicle.direction) {
          case 'east':
            updatedVehicle.x += vehicle.speed * deltaTime * 0.1 * prev.speed;
            break;
          case 'south':
            updatedVehicle.y += vehicle.speed * deltaTime * 0.1 * prev.speed;
            break;
          case 'west':
            updatedVehicle.x -= vehicle.speed * deltaTime * 0.1 * prev.speed;
            break;
          case 'north':
            updatedVehicle.y -= vehicle.speed * deltaTime * 0.1 * prev.speed;
            break;
        }
        
        // Check if vehicle is at an intersection
        const isAtIntersection = prev.intersections.some(intersection => {
          const dx = Math.abs(updatedVehicle.x - intersection.x);
          const dy = Math.abs(updatedVehicle.y - intersection.y);
          return dx < 30 && dy < 30; // Simple collision detection
        });
        
        // Handle traffic lights
        if (isAtIntersection) {
          updatedVehicle.waitTime += deltaTime * 0.001; // Convert to seconds
          if (!updatedVehicle.hasWaited) {
            updatedVehicle.hasWaited = true;
          }
        }
        
        return updatedVehicle;
      });
      
      // Remove vehicles that have exited the canvas
      const filteredVehicles = updatedVehicles.filter(vehicle => {
        return (
          vehicle.x < SIMULATION_CONFIG.CANVAS_WIDTH + 50 &&
          vehicle.y < SIMULATION_CONFIG.CANVAS_HEIGHT + 50 &&
          vehicle.x > -50 &&
          vehicle.y > -50
        );
      });
      
      const exitedCount = updatedVehicles.length - filteredVehicles.length;
      
      // Calculate average wait time
      const averageWaitTime = filteredVehicles.length > 0
        ? filteredVehicles.reduce((sum, v) => sum + (v.waitTime || 0), 0) / filteredVehicles.length
        : 0;
      
      return {
        ...prev,
        vehicles: filteredVehicles,
        vehicleCount: filteredVehicles.length,
        vehiclesExited: prev.vehiclesExited + exitedCount,
        averageWaitTime,
      };
    });
  }, []);

  // Update traffic lights using AI controller
  const updateTrafficLights = useCallback(() => {
    if (!simulationState.showAIControls) return;
    
    setSimulationState(prev => {
      const updatedIntersections = prev.intersections.map(intersection => {
        const updatedLights = aiController.current.updateLights(intersection);
        return {
          ...intersection,
          trafficLights: updatedLights,
        };
      });
      
      return {
        ...prev,
        intersections: updatedIntersections,
      };
    });
  }, [simulationState.showAIControls]);

  // Main game loop
  const gameLoop = useCallback((timestamp: number) => {
    if (!simulationState.isRunning) {
      return;
    }
    
    const deltaTime = timestamp - simulationState.lastUpdate;
    
    // Spawn new vehicles
    spawnVehicles(timestamp);
    
    // Update vehicle positions
    updateVehicles(deltaTime);
    
    // Update traffic lights with AI
    updateTrafficLights();
    
    // Schedule next frame
    animationFrameId.current = requestAnimationFrame(gameLoop);
    
    // Update last update time
    setSimulationState(prev => ({
      ...prev,
      lastUpdate: timestamp,
    }));
  }, [simulationState.isRunning, simulationState.lastUpdate, spawnVehicles, updateVehicles, updateTrafficLights]);

  // Start/stop the simulation
  useEffect(() => {
    if (simulationState.isRunning) {
      animationFrameId.current = requestAnimationFrame(gameLoop);
    }
    
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [simulationState.isRunning, gameLoop]);

  // Initialize simulation when component mounts or simulation type changes
  useEffect(() => {
    initializeSimulation();
  }, [initializeSimulation]);

  // Toggle simulation running state
  const toggleRunning = useCallback(() => {
    setSimulationState(prev => ({
      ...prev,
      isRunning: !prev.isRunning,
      lastUpdate: Date.now(),
    }));
  }, []);

  // Change simulation type (2-lane or 4-lane)
  const setSimulationType = useCallback((type: '2lane' | '4lane') => {
    setSimulationState(prev => ({
      ...prev,
      simulationType: type,
      isRunning: false, // Pause simulation when changing type
    }));
  }, []);

  // Change simulation speed
  const setSpeed = useCallback((speed: number) => {
    setSimulationState(prev => ({
      ...prev,
      speed: Math.max(0.1, Math.min(5, speed)),
    }));
  }, []);

  // Toggle AI controls
  const toggleAIControls = useCallback(() => {
    setSimulationState(prev => ({
      ...prev,
      showAIControls: !prev.showAIControls,
    }));
  }, []);

  // Toggle stats display
  const toggleStats = useCallback(() => {
    setSimulationState(prev => ({
      ...prev,
      showStats: !prev.showStats,
    }));
  }, []);

  // Reset simulation
  const resetSimulation = useCallback(() => {
    setSimulationState(prev => ({
      ...prev,
      isRunning: false,
      vehicles: [],
      vehicleCount: 0,
      totalVehicles: 0,
      vehiclesExited: 0,
      averageWaitTime: 0,
    }));
    
    // Re-initialize the simulation
    initializeSimulation();
  }, [initializeSimulation]);

  return {
    ...simulationState,
    toggleRunning,
    setSimulationType,
    setSpeed,
    toggleAIControls,
    toggleStats,
    resetSimulation,
  };
}
