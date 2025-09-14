import asyncio
import websockets

async def test_connection():
    try:
        async with websockets.connect('ws://localhost:8765') as websocket:
            print("✓ Successfully connected to WebSocket server")
            await websocket.send('{"type":"ping"}')
            response = await websocket.recv()
            print(f"✓ Server response: {response}")
    except Exception as e:
        print(f"✗ Connection failed: {e}")

if __name__ == "__main__":
    print("Testing WebSocket connection to ws://localhost:8765")
    asyncio.get_event_loop().run_until_complete(test_connection())
