# SUMO Traffic Simulation Integration

This project integrates the SUMO (Simulation of Urban MObility) traffic simulation with a Next.js frontend.

## Prerequisites

1. Install SUMO from https://www.eclipse.org/sumo/
2. Add SUMO to your system PATH
3. Install Python 3.7 or higher
4. Install required Python packages:
   ```bash
   pip install traci sumolib websockets
   ```

## Running the Simulation

1. Start the SUMO simulation server and Next.js development server:
   ```bash
   npm run sumo
   ```
   This will start both the Python SUMO server and the Next.js development server.

2. Open your browser and navigate to:
   ```
   http://localhost:3000/sumo
   ```

## Project Structure

- `public/sumo/` - SUMO configuration files
  - `intersection.net.xml` - Road network definition
  - `routes.rou.xml` - Vehicle routes and types
  - `intersection.sumocfg` - Main SUMO configuration
  - `gui-settings.cfg` - GUI visualization settings

- `lib/sumo/` - Server-side SUMO integration
  - `simulation.py` - Python script to run SUMO with WebSocket server

- `components/sumo/` - React components
  - `SumoViewer.tsx` - Main visualization component

- `hooks/` - Custom React hooks
  - `useSumoSimulation.ts` - Hook to connect to the SUMO WebSocket server

## How It Works

1. The Python script `simulation.py` starts a SUMO simulation and a WebSocket server
2. The React frontend connects to the WebSocket server
3. The simulation state is sent to the frontend in real-time
4. The frontend renders the simulation using HTML5 Canvas

## Customization

### Modifying the Road Network
Edit `public/sumo/intersection.net.xml` to change the road layout.

### Changing Vehicle Behavior
Edit `public/sumo/routes.rou.xml` to modify vehicle types, routes, and traffic patterns.

### Adjusting Simulation Parameters
Edit `public/sumo/intersection.sumocfg` to change simulation settings like duration and step length.

## Troubleshooting

- If the simulation doesn't start, ensure SUMO is properly installed and added to your PATH
- Check the terminal for Python errors if the WebSocket connection fails
- Make sure no other application is using port 8765 (WebSocket) or 3000 (Next.js)
