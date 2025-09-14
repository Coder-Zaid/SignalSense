import { SIMULATION_CONFIG } from './config';

export function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function getRandomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

export function getRandomColor(): string {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

export function getLanePosition(lane: number, totalLanes: number, isHorizontal: boolean): number {
  const { ROAD_WIDTH, INTERSECTION_SIZE } = SIMULATION_CONFIG;
  const laneWidth = ROAD_WIDTH / totalLanes;
  const offset = (lane + 0.5) * laneWidth - ROAD_WIDTH / 2;
  
  return isHorizontal 
    ? offset + INTERSECTION_SIZE / 2 
    : offset - INTERSECTION_SIZE / 2;
}

export function getTrafficLightState(timer: number): 'red' | 'yellow' | 'green' {
  const { GREEN_DURATION, YELLOW_DURATION } = SIMULATION_CONFIG.LIGHT_CYCLE;
  const cycleTime = timer % (GREEN_DURATION + YELLOW_DURATION + 2);
  
  if (cycleTime < GREEN_DURATION) return 'green';
  if (cycleTime < GREEN_DURATION + YELLOW_DURATION) return 'yellow';
  return 'red';
}

export function calculateWaitTime(vehicles: any[]): number {
  if (vehicles.length === 0) return 0;
  const totalWaitTime = vehicles.reduce((sum, vehicle) => sum + (vehicle.waitTime || 0), 0);
  return totalWaitTime / vehicles.length;
}

export function getTrafficDensity(vehicles: any[], area: number): number {
  return Math.min(1, vehicles.length / (area * 0.001));
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function getRandomVehicleType() {
  const types = ['car', 'truck', 'bike', 'bus'];
  return types[Math.floor(Math.random() * types.length)];
}

export function getVehicleDimensions(type: string) {
  switch (type) {
    case 'truck':
      return { width: 24, height: 12 };
    case 'bus':
      return { width: 20, height: 10 };
    case 'bike':
      return { width: 8, height: 5 };
    default: // car
      return { width: 16, height: 8 };
  }
}
