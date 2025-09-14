import { useState, useEffect, useCallback, useRef } from 'react';

type Direction = 'north' | 'south' | 'east' | 'west';
type VehicleType = 'car' | 'bus' | 'bike' | 'emergency';

interface VehicleData {
  id: string;
  x: number;
  y: number;
  angle: number;
  speed: number;
  type: VehicleType;
  route: string[];
  lane: number;
  status: 'moving' | 'waiting' | 'arrived';
  color?: string;
}

interface TrafficLightData {
  state: 'r' | 'y' | 'g' | 'G' | 'u';
  phases: string[];
  position?: {
    x: number;
    y: number;
  };
}

interface BaseMessage {
  type: 'update' | 'control' | 'error' | 'connection';
  message?: string;
}

interface SimulationData extends BaseMessage {
  type: 'update' | 'error' | 'connection';
  step: number;
  vehicles: Record<string, VehicleData>;
  trafficLights: Record<string, TrafficLightData>;
  time: number;
  status?: string;  // For connection status
}

export function useSumoSimulation() {
  const [isConnected, setIsConnected] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [simulationData, setSimulationData] = useState<SimulationData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const ws = useRef<WebSocket | null>(null);

  const connect = useCallback((): (() => void) => {
    if (ws.current) return () => {};

    let reconnectAttempts = 0;
    const maxReconnectAttempts = 5;
    let reconnectTimer: NodeJS.Timeout;

    const connectWebSocket = () => {
      try {
        console.log('Attempting to connect to WebSocket server...');
        const websocket = new WebSocket('ws://localhost:8765');
        ws.current = websocket;
        
        websocket.onopen = () => {
          console.log('Connected to SUMO simulation server');
          setIsConnected(true);
          setError(null);
          reconnectAttempts = 0; // Reset reconnect attempts on successful connection
        };

        websocket.onmessage = (event: MessageEvent) => {
          try {
            const data: SimulationData = JSON.parse(event.data.toString());
            console.log('Received message:', data.type);
            
            if (data.type === 'update') {
              setSimulationData(data);
            } else if (data.type === 'error') {
              setError(data.message || 'Error in simulation');
            } else if (data.type === 'connection') {
              console.log('Server connection established:', data.message);
            }
          } catch (err) {
            console.error('Error parsing WebSocket message:', err);
            setError('Failed to parse simulation data');
          }
        };

        websocket.onerror = (error: Event) => {
          console.error('WebSocket error:', error);
          setError('Failed to connect to SUMO simulation');
        };

        websocket.onclose = (event: CloseEvent) => {
          console.log('WebSocket connection closed:', event.code, event.reason);
          setIsConnected(false);
          setIsRunning(false);
          ws.current = null;

          // Attempt to reconnect
          if (reconnectAttempts < maxReconnectAttempts) {
            reconnectAttempts++;
            const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000); // Exponential backoff
            console.log(`Reconnecting in ${delay}ms (attempt ${reconnectAttempts}/${maxReconnectAttempts})...`);
            reconnectTimer = setTimeout(connectWebSocket, delay);
          } else {
            setError('Failed to connect to simulation server after multiple attempts');
          }
        };
      } catch (error) {
        console.error('Failed to create WebSocket:', error);
        setError('Failed to connect to simulation server');
      }
    };

    // Initial connection
    connectWebSocket();

    // Cleanup function
    return () => {
      if (ws.current) {
        ws.current.close();
        ws.current = null;
      }
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
      }
    };
  }, []);

  const startSimulation = useCallback(() => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      try {
        ws.current.send(JSON.stringify({
          type: 'control',
          action: 'start'
        }));
        setIsRunning(true);
        setError(null);
      } catch (err) {
        console.error('Failed to start simulation:', err);
        setError('Failed to start simulation');
      }
    } else {
      setError('Not connected to simulation server');
      setIsConnected(false);
    }
  }, []);

  const stopSimulation = useCallback(() => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({
        type: 'control',
        action: 'stop'
      }));
      setIsRunning(false);
    }
  }, []);

  const setSimulationSpeed = useCallback((speed: number) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({
        type: 'control',
        action: 'set_speed',
        speed
      }));
    }
  }, []);

  useEffect(() => {
    connect();
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [connect]);

  return {
    isConnected,
    isRunning,
    simulationData,
    error,
    startSimulation,
    stopSimulation,
    setSimulationSpeed
  };
}
