import { spawn } from 'child_process';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import open from 'open';

// Get the current directory
const __dirname = dirname(fileURLToPath(import.meta.url));
const serverDir = resolve(__dirname, '..');

// Function to run a command
function runCommand(command, args, options = {}) {
  return spawn(command, args, {
    stdio: 'inherit',
    shell: true,
    ...options
  });
}

console.log('Starting development servers...');

// Start the concurrently command to run all servers
const concurrentlyProcess = runCommand(
  'npx', 
  [
    'concurrently',
    '--prefix-colors', '"bgGreen.bold,bgBlue.bold,bgMagenta.bold"',
    '--prefix', '"[{time}] [{name}]"',
    '--timestamp-format', '"HH:mm:ss"',
    '--names', '"SERVER,CLIENT,ADMIN"',
    '--kill-others',
    '"npm run dev:server"',
    '"npm run dev:client"',
    '"npm run dev:admin"'
  ],
  { cwd: serverDir }
);

// Wait a bit for servers to start up before opening the browser
setTimeout(() => {
  console.log('Opening landing page in browser...');
  // Open the server's landing page (index.html) instead of the client application
  open('http://localhost:5000');
}, 5000);

// Handle process termination
process.on('SIGINT', () => {
  console.log('Shutting down all processes...');
  concurrentlyProcess.kill('SIGINT');
  process.exit(0);
});
