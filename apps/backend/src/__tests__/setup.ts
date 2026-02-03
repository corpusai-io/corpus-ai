// Test setup file
// Runs before all tests

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.API_URL = process.env.API_URL || 'http://127.0.0.1:8001';

// Increase timeout for integration tests
jest.setTimeout(30000);

// Global test utilities
declare global {
  var testUtils: {
    generateTestEmail: () => string;
    generateTestPassword: () => string;
    sleep: (ms: number) => Promise<void>;
  };
}

global.testUtils = {
  generateTestEmail: () => `test-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`,
  generateTestPassword: () => 'TestPassword123!',
  sleep: (ms: number) => new Promise((resolve) => setTimeout(resolve, ms)),
};

// Check if server is running before tests
beforeAll(async () => {
  const API_URL = process.env.API_URL || 'http://localhost:8001';

  console.log('\n🔍 Checking if backend server is running...');
  console.log(`📍 API URL: ${API_URL}`);

  try {
    const response = await fetch(`${API_URL}/health`, {
      method: 'GET',
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Server is running!');
      console.log(`   Status: ${data.status}`);
      console.log(`   DynamoDB: ${data.dynamodb}`);
      console.log(`   Region: ${data.region}\n`);
    } else {
      console.error('❌ Server responded with error:', response.status);
      console.error('⚠️  Make sure the backend server is running: pnpm dev\n');
    }
  } catch (error) {
    console.error('\n❌ ERROR: Cannot connect to backend server!');
    console.error('');
    console.error('Please start the backend server first:');
    console.error('  1. Open a terminal');
    console.error('  2. Run: cd apps/backend');
    console.error('  3. Run: pnpm dev');
    console.error('  4. Wait for "Backend server running on port 8001"');
    console.error('  5. Then run tests in a NEW terminal\n');
    throw new Error('Backend server is not running');
  }
});

// Suppress console output during tests (optional)
if (process.env.SUPPRESS_TEST_LOGS === 'true') {
  global.console = {
    ...console,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
  };
}

export {};
