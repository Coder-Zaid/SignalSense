export type Direction = 'north' | 'south' | 'east' | 'west';

export type TrafficLightState = 'red' | 'yellow' | 'green';

export type VehicleStatus = 'moving' | 'waiting' | 'exited';

export interface Vehicle {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  direction: Direction;
  color: string;
  waitTime: number;
  hasWaited: boolean;
  status: VehicleStatus;
}

export interface Position {
  x: number;
  y: number;
}

export interface TrafficLight {
  id: string;
  state: TrafficLightState;
  timer: number;
  direction: Direction;
  position: Position;
}

export interface TrafficSignal {
  id: string;
  state: TrafficLightState;
  countdown: number;
  aiControlled: boolean;
}

export interface Intersection {
  id: string;
  x: number;
  y: number;
  trafficLights: TrafficLight[];
  vehicles: Vehicle[]; // Track vehicles currently in this intersection
}

export interface SimulationMetrics {
  totalVehicles: number;
  averageWaitTime: number;
  totalWaitTime: number;
  vehiclesExited: number;
}

export interface SimulationState {
  isRunning: boolean;
  simulationType: '2lane' | '4lane';
  speed: number;
  showAIControls: boolean;
  showStats: boolean;
  vehicleCount: number;
  averageWaitTime: number;
  totalVehicles: number;
  vehiclesExited: number;
  lastUpdate: number;
  intersections: Intersection[];
  vehicles: Vehicle[];
  time: number;
  metrics: SimulationMetrics;
}
