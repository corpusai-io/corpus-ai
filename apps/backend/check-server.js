// Quick script to check if backend server is running

const API_URL = process.env.API_URL || 'http://localhost:8001';

console.log('🔍 Checking backend server...');
console.log(`📍 URL: ${API_URL}\n`);

fetch(`${API_URL}/health`)
  .then((response) => response.json())
  .then((data) => {
    console.log('✅ SUCCESS! Server is running!\n');
    console.log('Server Status:');
    console.log(`  Status: ${data.status}`);
    console.log(`  DynamoDB: ${data.dynamodb}`);
    console.log(`  Region: ${data.region}`);
    console.log('\n✅ You can now run tests: pnpm test\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ ERROR: Cannot connect to server!\n');
    console.error('Please start the backend server:');
    console.error('  1. Run: pnpm dev');
    console.error('  2. Wait for "Backend server running on port 8001"');
    console.error('  3. Then run this check again: node check-server.js\n');
    console.error(`Error details: ${error.message}\n`);
    process.exit(1);
  });
