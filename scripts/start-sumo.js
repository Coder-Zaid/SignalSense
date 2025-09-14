const { spawn } = require('child_process');
const path = require('path');

// Start the Python SUMO simulation server
const pythonProcess = spawn('python', [path.join(__dirname, '../lib/sumo/simulation.py')]);

pythonProcess.stdout.on('data', (data) => {
  console.log(`[SUMO] ${data}`);
});

pythonProcess.stderr.on('data', (data) => {
  console.error(`[SUMO Error] ${data}`);
});

pythonProcess.on('close', (code) => {
  console.log(`SUMO process exited with code ${code}`);
});

// Start Next.js development server
const nextProcess = spawn('npm', ['run', 'dev'], { stdio: 'inherit' });

// Handle process termination
process.on('SIGINT', () => {
  console.log('Shutting down servers...');
  pythonProcess.kill();
  nextProcess.kill();
  process.exit();
});

console.log('SUMO simulation server and Next.js dev server starting...');
console.log('Access the simulation at: http://localhost:3000/sumo');
