import os
import sys
import traci
from sumolib import checkBinary
import asyncio
import websockets
import json
import time

class SUMOSimulation:
    def __init__(self):
        print("Initializing SUMO simulation...")
        try:
            self.sumo_binary = checkBinary('sumo-gui' if 'SUMO_HOME' in os.environ else 'sumo-gui')
            print(f"Using SUMO binary: {self.sumo_binary}")
        except Exception as e:
            print(f"Error finding SUMO binary: {e}")
            print("Make sure SUMO is installed and in your PATH")
            raise
            
        self.config_file = os.path.join('public', 'sumo', 'intersection.sumocfg')
        print(f"Using config file: {self.config_file}")
        
        if not os.path.exists(self.config_file):
            print(f"Error: Config file not found at {self.config_file}")
            raise FileNotFoundError(f"Config file not found: {self.config_file}")
            
        self.connected_clients = set()
        self.simulation_running = False
        self.simulation_speed = 1.0

    async def start_websocket_server(self):
        try:
            server = await websockets.serve(
                self.handle_client,
                "0.0.0.0",  # Bind to all interfaces
                8765,
                ping_interval=20,  # Add ping/pong for connection health
                ping_timeout=20,
                close_timeout=1
            )
            print("WebSocket server started on ws://127.0.0.1:8765")
            return server
        except Exception as e:
            print(f"Failed to start WebSocket server: {e}")
            if "Address already in use" in str(e):
                print("Port 8765 is already in use. Try closing any other applications using this port.")
            raise

    async def handle_client(self, websocket, path):
        client_ip = websocket.remote_address[0] if websocket.remote_address else 'unknown'
        print(f"New WebSocket connection from {client_ip}")
        
        self.connected_clients.add(websocket)
        try:
            # Send initial connection acknowledgment
            await websocket.send(json.dumps({
                'type': 'connection',
                'status': 'connected',
                'message': 'Successfully connected to SUMO simulation server'
            }))
            
            async for message in websocket:
                try:
                    await self.handle_message(message, websocket)
                except json.JSONDecodeError:
                    print(f"Invalid JSON received from {client_ip}")
                    await websocket.send(json.dumps({
                        'type': 'error',
                        'message': 'Invalid JSON format'
                    }))
                except Exception as e:
                    print(f"Error handling message from {client_ip}: {str(e)}")
                    await websocket.send(json.dumps({
                        'type': 'error',
                        'message': f'Error processing message: {str(e)}'
                    }))
        except websockets.exceptions.ConnectionClosed as e:
            print(f"Connection closed by {client_ip}: {e}")
        except Exception as e:
            print(f"Unexpected error with {client_ip}: {str(e)}")
        finally:
            self.connected_clients.discard(websocket)
            print(f"Client {client_ip} disconnected")

    async def handle_message(self, message, websocket):
        try:
            data = json.loads(message)
            if data.get('type') == 'control':
                if data.get('action') == 'start':
                    self.simulation_running = True
                    await self.run_simulation()
                elif data.get('action') == 'stop':
                    self.simulation_running = False
                elif data.get('action') == 'set_speed':
                    self.simulation_speed = float(data.get('speed', 1.0))
        except json.JSONDecodeError:
            print("Invalid JSON received")

    async def broadcast(self, message):
        if self.connected_clients:
            await asyncio.wait([client.send(message) for client in self.connected_clients])

    async def run_simulation(self):
        traci.start([self.sumo_binary, '-c', self.config_file, '--start', '--quit-on-end'])
        
        step = 0
        while self.simulation_running and step < 3600:  # 1 hour simulation
            traci.simulationStep()
            
            # Get vehicle data
            vehicles = {}
            for veh_id in traci.vehicle.getIDList():
                pos = traci.vehicle.getPosition(veh_id)
                angle = traci.vehicle.getAngle(veh_id)
                speed = traci.vehicle.getSpeed(veh_id)
                route = traci.vehicle.getRoute(veh_id)
                
                vehicles[veh_id] = {
                    'id': veh_id,
                    'x': pos[0],
                    'y': pos[1],
                    'angle': angle,
                    'speed': speed,
                    'type': traci.vehicle.getTypeID(veh_id),
                    'route': route
                }
            
            # Get traffic light states
            traffic_lights = {}
            for tl_id in traci.trafficlight.getIDList():
                state = traci.trafficlight.getRedYellowGreenState(tl_id)
                phases = traci.trafficlight.getAllProgramLogics(tl_id)
                
                traffic_lights[tl_id] = {
                    'state': state,
                    'phases': [p.state for p in phases[0].phases] if phases else []
                }
            
            # Broadcast data to all connected clients
            await self.broadcast(json.dumps({
                'type': 'update',
                'step': step,
                'vehicles': vehicles,
                'trafficLights': traffic_lights,
                'time': traci.simulation.getTime()
            }))
            
            step += 1
            await asyncio.sleep(0.1 / self.simulation_speed)
        
        traci.close()
        self.simulation_running = False

async def main():
    simulation = SUMOSimulation()
    server = await simulation.start_websocket_server()
    await server.wait_closed()

if __name__ == "__main__":
    asyncio.run(main())
