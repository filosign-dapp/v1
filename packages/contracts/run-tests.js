import { execSync } from 'child_process';

try {
  console.log('Running Hardhat tests...');
  const output = execSync('bunx hardhat test', { encoding: 'utf8', cwd: process.cwd() });
  console.log(output);
} catch (error) {
  console.error('Test failed:', error.message);
  if (error.stdout) console.log('STDOUT:', error.stdout);
  if (error.stderr) console.log('STDERR:', error.stderr);
}
