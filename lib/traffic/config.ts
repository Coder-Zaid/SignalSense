export const SIMULATION_CONFIG = {
  // Canvas dimensions
  CANVAS_WIDTH: 1000,
  CANVAS_HEIGHT: 700,
  
  // Intersection settings
  INTERSECTION_SIZE: 120,
  ROAD_WIDTH: 80,
  
  // Vehicle settings
  VEHICLE_SIZE: 12,
  VEHICLE_SPEED: 2,
  VEHICLE_SPAWN_RATE: 0.02, // Chance per frame
  
  // Traffic light settings
  LIGHT_CYCLE: {
    GREEN_DURATION: 10, // seconds
    YELLOW_DURATION: 3, // seconds
    RED_DURATION: 10,   // seconds
  },
  
  // AI settings
  AI: {
    LEARNING_RATE: 0.1,
    DISCOUNT_FACTOR: 0.95,
    EXPLORATION_RATE: 0.3,
    REWARD_WEIGHTS: {
      WAIT_TIME: -0.1,
      THROUGHPUT: 1.0,
      EMERGENCY: 5.0,
    },
  },
  
  // Simulation speed
  SIMULATION_SPEED: 1.0,
  
  // Debug mode
  DEBUG: false,
};

export type SimulationType = '2lane' | '4lane';

export const LANE_CONFIG = {
  '2lane': {
    lanes: 2,
    flowRate: 0.8,
    speedVariation: 0.3,
  },
  '4lane': {
    lanes: 4,
    flowRate: 1.0,
    speedVariation: 0.5,
  },
};
