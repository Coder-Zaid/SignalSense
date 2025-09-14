'use client';

import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import { SIMULATION_CONFIG, SimulationType } from '@/lib/traffic/config';

export interface Metrics {
  vehicleCount: number;
  averageWaitTime: number;
  totalVehicles: number;
  vehiclesExited: number;
  averageSpeed: number;
  congestion: number;
  waitTime: number;
  throughput: number;
  emergencyActive: boolean;
}

type SimulationState = {
  isRunning: boolean;
  simulationType: SimulationType;
  speed: number;
  showAIControls: boolean;
  showStats: boolean;
  metrics: Metrics;
  isTransitioning: boolean;
};

type SimulationAction =
  | { type: 'TOGGLE_RUNNING' }
  | { type: 'SET_SIMULATION_TYPE'; payload: SimulationType }
  | { type: 'SET_SPEED'; payload: number }
  | { type: 'TOGGLE_AI_CONTROLS' }
  | { type: 'TOGGLE_STATS' }
  | { type: 'SET_TRANSITIONING'; payload: boolean }
  | { type: 'UPDATE_METRICS'; payload: Partial<Metrics> };

const initialState: SimulationState = {
  isRunning: false,
  simulationType: '4lane',
  speed: 1.0,
  showAIControls: true,
  showStats: true,
  isTransitioning: false,
  metrics: {
    vehicleCount: 0,
    averageWaitTime: 0,
    totalVehicles: 0,
    vehiclesExited: 0,
    averageSpeed: 0,
    congestion: 0,
    waitTime: 0,
    throughput: 0,
    emergencyActive: false,
  },
};

function simulationReducer(state: SimulationState, action: SimulationAction): SimulationState {
  switch (action.type) {
    case 'TOGGLE_RUNNING':
      return { ...state, isRunning: !state.isRunning };
    case 'SET_SIMULATION_TYPE':
      return { ...state, simulationType: action.payload };
    case 'SET_SPEED':
      return { ...state, speed: Math.max(0.1, Math.min(5, action.payload)) };
    case 'TOGGLE_AI_CONTROLS':
      return { ...state, showAIControls: !state.showAIControls };
    case 'TOGGLE_STATS':
      return { ...state, showStats: !state.showStats };
    case 'SET_TRANSITIONING':
      return { ...state, isTransitioning: action.payload };
    case 'UPDATE_METRICS':
      return { 
        ...state, 
        metrics: {
          ...state.metrics,
          ...action.payload
        } 
      };
    default:
      return state;
  }
}

interface SimulationContextType {
  state: SimulationState;
  dispatch: React.Dispatch<SimulationAction>;
  toggleRunning: () => void;
  setSimulationType: (type: SimulationType) => void;
  setSpeed: (speed: number) => void;
  toggleAIControls: () => void;
  toggleStats: () => void;
  updateMetrics: (metrics: Partial<Metrics>) => void;
  setTransitioning: (isTransitioning: boolean) => void;
}

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

export function SimulationProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(simulationReducer, initialState);

  const toggleRunning = useCallback(() => dispatch({ type: 'TOGGLE_RUNNING' }), []);
  const setSimulationType = useCallback((type: SimulationType) => 
    dispatch({ type: 'SET_SIMULATION_TYPE', payload: type }), []);
  const setSpeed = useCallback((speed: number) => 
    dispatch({ type: 'SET_SPEED', payload: speed }), []);
  const toggleAIControls = useCallback(() => 
    dispatch({ type: 'TOGGLE_AI_CONTROLS' }), []);
  const toggleStats = useCallback(() => 
    dispatch({ type: 'TOGGLE_STATS' }), []);
  const updateMetrics = useCallback((metrics: Partial<Metrics>) => 
    dispatch({ type: 'UPDATE_METRICS', payload: metrics }), []);
  const setTransitioning = useCallback((isTransitioning: boolean) =>
    dispatch({ type: 'SET_TRANSITIONING', payload: isTransitioning }), []);

  const value = {
    state,
    dispatch,
    toggleRunning,
    setSimulationType,
    setSpeed,
    toggleAIControls,
    toggleStats,
    updateMetrics,
    setTransitioning,
  };

  return (
    <SimulationContext.Provider value={value}>
      {children}
    </SimulationContext.Provider>
  );
}

export function useSimulation() {
  const context = useContext(SimulationContext);
  if (context === undefined) {
    throw new Error('useSimulation must be used within a SimulationProvider');
  }
  return context;
}

// Export the context type for use in other files
export type { SimulationContextType };
