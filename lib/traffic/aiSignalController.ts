import { TrafficLight, Intersection, Vehicle, Direction, TrafficLightState } from '@/components/traffic/types';

export class AISignalController {
  private intersection: Intersection;
  private signals: TrafficLight[];
  private lastUpdate: number;
  private emergencyMode: boolean = false;
  private emergencyDirection: Direction | null = null;
  private normalCycleTime = 60; // seconds
  private minGreenTime = 10; // minimum green light duration
  private maxGreenTime = 90; // maximum green light duration
  private yellowTime = 3; // yellow light duration

  constructor(intersection: Intersection) {
    this.intersection = intersection;
    this.signals = [];
    this.lastUpdate = Date.now();
    this.initializeSignals();
  }

  private initializeSignals() {
    const centerX = this.intersection.x;
    const centerY = this.intersection.y;
    
    this.signals = [
      {
        id: 'north',
        state: 'red',
        timer: 30,
        direction: 'north' as Direction,
        position: { x: centerX, y: centerY - 50 }
      },
      {
        id: 'south',
        state: 'red',
        timer: 30,
        direction: 'south' as Direction,
        position: { x: centerX, y: centerY + 50 }
      },
      {
        id: 'east',
        state: 'green',
        timer: 30,
        direction: 'east' as Direction,
        position: { x: centerX + 50, y: centerY }
      },
      {
        id: 'west',
        state: 'red',
        timer: 30,
        direction: 'west' as Direction,
        position: { x: centerX - 50, y: centerY }
      }
    ];
  }

  public update(vehicles: Vehicle[], emergencyVehicles: Vehicle[]): TrafficLight[] {
    const now = Date.now();
    const deltaTime = (now - this.lastUpdate) / 1000; // Convert to seconds
    this.lastUpdate = now;

    // Check for emergency vehicles
    this.handleEmergencyVehicles(emergencyVehicles);

    if (this.emergencyMode) {
      this.handleEmergencyMode();
    } else {
      this.handleNormalMode(vehicles, deltaTime);
    }

    // Update countdowns
    this.updateCountdowns(deltaTime);

    return [...this.signals];
  }

  private handleEmergencyVehicles(emergencyVehicles: Vehicle[]) {
    if (emergencyVehicles.length > 0) {
      const emergencyVehicle = emergencyVehicles[0];
      // Determine which direction the emergency vehicle is approaching from
      const dx = emergencyVehicle.x - this.intersection.x;
      const dy = emergencyVehicle.y - this.intersection.y;
      const angle = Math.atan2(dy, dx) * 180 / Math.PI;
      
      if (angle < -135 || angle > 135) {
        this.emergencyDirection = 'west';
      } else if (angle > -45 && angle < 45) {
        this.emergencyDirection = 'east';
      } else if (angle >= 45 && angle <= 135) {
        this.emergencyDirection = 'south';
      } else {
        this.emergencyDirection = 'north';
      }
      
      this.emergencyMode = true;
    } else {
      this.emergencyMode = false;
      this.emergencyDirection = null;
    }
  }

  private handleEmergencyMode() {
    if (!this.emergencyDirection) return;

    // Set all signals to red except for the emergency direction
    this.signals.forEach(signal => {
      if (signal.direction === this.emergencyDirection) {
        signal.state = 'green';
        signal.timer = 15; // Extended green time for emergency
      } else {
        signal.state = 'red';
        signal.timer = 15;
      }
    });
  }

  private handleNormalMode(vehicles: Vehicle[], deltaTime: number) {
    // Count vehicles approaching each direction
    const vehicleCounts = {
      north: this.countVehiclesInDirection(vehicles, 'north'),
      south: this.countVehiclesInDirection(vehicles, 'south'),
      east: this.countVehiclesInDirection(vehicles, 'east'),
      west: this.countVehiclesInDirection(vehicles, 'west'),
    };

    // Find current green signal
    const currentGreen = this.signals.find(s => s.state === 'green');
    if (!currentGreen) return;

    // If current green has expired or traffic is too high in other directions
    if (currentGreen.timer <= 0 || this.shouldSwitchSignal(vehicleCounts, currentGreen.direction)) {
      this.changeSignal(currentGreen.direction);
    }
  }

  private shouldSwitchSignal(vehicleCounts: Record<string, number>, currentDirection: Direction): boolean {
    // Get current direction index for rotation
    const directions: Direction[] = ['north', 'east', 'south', 'west'];
    const currentIndex = directions.indexOf(currentDirection);
    
    // Check if any other direction has significantly more vehicles waiting
    const currentCount = vehicleCounts[currentDirection] || 0;
    const maxOtherDirection = Math.max(
      ...Object.entries(vehicleCounts)
        .filter(([dir]) => dir !== currentDirection)
        .map(([_, count]) => count as number)
    );

    // If another direction has at least 3 more vehicles waiting, consider switching
    return maxOtherDirection > currentCount + 3;
  }

  private changeSignal(currentDirection: Direction) {
    // Set current to yellow
    const currentSignal = this.signals.find(s => s.direction === currentDirection);
    if (currentSignal) {
      currentSignal.state = 'yellow';
      currentSignal.timer = this.yellowTime;
    }

    // Find next direction (simple rotation for now)
    const directions: Direction[] = ['north', 'east', 'south', 'west'];
    const currentIndex = directions.indexOf(currentDirection);
    const nextDirection = directions[(currentIndex + 1) % directions.length];
    
    // Set next direction to green after a short delay
    setTimeout(() => {
      const nextSignal = this.signals.find(s => s.direction === nextDirection);
      if (nextSignal) {
        nextSignal.state = 'green';
        nextSignal.timer = this.calculateGreenTime(nextDirection);
      }
      if (currentSignal) {
        currentSignal.state = 'red';
      }
    }, this.yellowTime * 1000);
  }

  private calculateGreenTime(direction: Direction): number {
    // Base green time with some randomness
    let greenTime = this.minGreenTime + Math.random() * 20;
    
    // Get number of vehicles in this direction
    const vehicleCount = this.intersection.vehicles.filter(
      v => v.direction === direction && v.status === 'waiting'
    ).length;
    
    // Increase green time based on number of waiting vehicles
    greenTime += Math.min(vehicleCount * 2, 30); // Cap at +30 seconds
    
    // Adjust based on time of day (simulated)
    const hour = new Date().getHours();
    if (hour >= 7 && hour <= 9) { // Morning rush
      greenTime *= 1.3;
    } else if (hour >= 16 && hour <= 18) { // Evening rush
      greenTime *= 1.5;
    }
    
    // Ensure within bounds
    return Math.min(Math.max(greenTime, this.minGreenTime), this.maxGreenTime);
  }

  private countVehiclesInDirection(vehicles: Vehicle[], direction: Direction): number {
    // Count vehicles approaching the intersection from the given direction
    return vehicles.filter(vehicle => {
      if (vehicle.status !== 'moving') return false;
      
      const dx = vehicle.x - this.intersection.x;
      const dy = vehicle.y - this.intersection.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Only count vehicles within 100 units of the intersection
      if (distance > 100) return false;
      
      // Check if vehicle is approaching from the given direction
      const angle = Math.atan2(dy, dx) * 180 / Math.PI;
      
      switch (direction) {
        case 'north': return angle < -135 || angle > 135;
        case 'east': return angle > -45 && angle < 45;
        case 'south': return angle > -45 && angle < 135;
        case 'west': return angle < -45 && angle > -135;
        default: return false;
      }
    }).length;
  }

  private updateCountdowns(deltaTime: number) {
    this.signals.forEach(signal => {
      if (signal.state === 'green' || signal.state === 'yellow') {
        signal.timer = Math.max(0, signal.timer - deltaTime);
      }
    });
  }
}
