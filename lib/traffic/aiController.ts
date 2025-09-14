import { TrafficLight, Intersection, Vehicle } from '@/components/traffic/types';

type QTable = Record<string, Record<string, number>>;

export class TrafficAIController {
  private qTable: QTable = {};
  private learningRate = 0.1;
  private discountFactor = 0.95;
  private explorationRate = 0.3;
  private lastState: string = '';
  private lastAction: string = '';
  private lastReward: number = 0;

  constructor() {
    this.initializeQTable();
  }

  private initializeQTable() {
    // Initialize Q-table with possible states and actions
    const states = ['high', 'medium', 'low'];
    const actions = ['extendGreen', 'switchToNext', 'maintain'];
    
    states.forEach(state => {
      this.qTable[state] = {};
      actions.forEach(action => {
        this.qTable[state][action] = 0; // Initialize Q-values to 0
      });
    });
  }

  private getState(intersection: Intersection): string {
    // Calculate vehicle density for each direction
    const densities = {
      north: this.calculateDensity(intersection, 'north'),
      south: this.calculateDensity(intersection, 'south'),
      east: this.calculateDensity(intersection, 'east'),
      west: this.calculateDensity(intersection, 'west'),
    };

    // Determine the busiest direction
    const maxDensity = Math.max(...Object.values(densities));
    
    if (maxDensity > 0.7) return 'high';
    if (maxDensity > 0.3) return 'medium';
    return 'low';
  }

  private calculateDensity(intersection: Intersection, direction: string): number {
    const vehiclesInLane = intersection.vehicles.filter(
      v => v.direction === direction && v.status !== 'exited'
    ).length;
    return vehiclesInLane / 10; // Normalize to 0-1 range
  }

  private getReward(intersection: Intersection): number {
    // Calculate reward based on total wait time
    const totalWaitTime = intersection.vehicles.reduce(
      (sum, vehicle) => sum + vehicle.waitTime, 0
    );
    
    // Negative reward for waiting vehicles
    return -totalWaitTime;
  }

  private chooseAction(state: string): string {
    // Exploration vs exploitation
    if (Math.random() < this.explorationRate) {
      // Explore: random action
      const actions = Object.keys(this.qTable[state]);
      return actions[Math.floor(Math.random() * actions.length)];
    }
    
    // Exploit: best known action
    return Object.entries(this.qTable[state]).reduce(
      (best, [action, value]) => 
        value > (this.qTable[state][best] || -Infinity) ? action : best,
      Object.keys(this.qTable[state])[0]
    );
  }

  private updateQValue(state: string, action: string, reward: number, nextState: string) {
    const oldValue = this.qTable[state][action];
    const nextMax = Math.max(...Object.values(this.qTable[nextState] || { 0: 0 }));
    
    // Q-learning formula
    this.qTable[state][action] = oldValue + this.learningRate * 
      (reward + this.discountFactor * nextMax - oldValue);
  }

  public updateLights(intersection: Intersection): TrafficLight[] {
    const currentState = this.getState(intersection);
    const reward = this.getReward(intersection);

    // Update Q-table if we have a previous state
    if (this.lastState && this.lastAction) {
      this.updateQValue(this.lastState, this.lastAction, reward, currentState);
    }

    // Choose new action
    const action = this.chooseAction(currentState);
    
    // Store for next update
    this.lastState = currentState;
    this.lastAction = action;
    this.lastReward = reward;

    // Apply the chosen action
    return this.applyAction(intersection.trafficLights, action);
  }

  private applyAction(lights: TrafficLight[], action: string): TrafficLight[] {
    return lights.map(light => {
      const newLight = { ...light };
      
      switch (action) {
        case 'extendGreen':
          if (light.state === 'green') {
            newLight.timer += 5; // Extend green light
          }
          break;
          
        case 'switchToNext':
          if (light.state === 'green') {
            newLight.state = 'yellow';
            newLight.timer = 2; // Yellow light duration
          } else if (light.state === 'yellow') {
            newLight.state = 'red';
            // Find next direction to turn green
            const nextDirection = this.getNextDirection(light.direction);
            const nextLight = lights.find(l => l.direction === nextDirection);
            if (nextLight) {
              const nextLightIndex = lights.findIndex(l => l.direction === nextDirection);
              lights[nextLightIndex].state = 'green';
              lights[nextLightIndex].timer = 10; // Default green duration
            }
          }
          break;
          
        case 'maintain':
        default:
          // Keep current state
          break;
      }
      
      return newLight;
    });
  }

  private getNextDirection(current: string): string {
    const directions = ['north', 'east', 'south', 'west'];
    const currentIndex = directions.indexOf(current);
    return directions[(currentIndex + 1) % directions.length];
  }
}
