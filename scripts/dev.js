#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

console.log('🚀 Starting Dynamic Flow Development Environment...\n');

// Function to spawn a process with proper logging
function spawnProcess(name, command, args, options = {}) {
  console.log(`📦 Starting ${name}...`);
  
  const child = spawn(command, args, {
    stdio: 'inherit',
    shell: true,
    ...options
  });

  child.on('error', (error) => {
    console.error(`❌ ${name} error:`, error);
  });

  child.on('exit', (code) => {
    if (code !== 0) {
      console.error(`❌ ${name} exited with code ${code}`);
    } else {
      console.log(`✅ ${name} exited successfully`);
    }
  });

  return child;
}

// Start API server
const apiProcess = spawnProcess(
  'API Server',
  'npm',
  ['run', 'dev'],
  { cwd: join(rootDir, 'apps/api') }
);

// Wait a bit for API to start, then start frontend
setTimeout(() => {
  const builderProcess = spawnProcess(
    'Builder App',
    'npm',
    ['run', 'dev'],
    { cwd: join(rootDir, 'apps/builder') }
  );
}, 3000);

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down development servers...');
  
  // Kill child processes
  if (apiProcess) {
    apiProcess.kill('SIGINT');
  }
  
  process.exit(0);
});

console.log('🔗 URLs:');
console.log('   API Server: http://localhost:3001');
console.log('   Builder App: http://localhost:3000');
console.log('   Health Check: http://localhost:3001/health');
console.log('\n💡 Press Ctrl+C to stop all servers\n');
