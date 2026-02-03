/**
 * DEBUG TEST - Phase 2: Testing remaining endpoints
 */

describe('🔍 DEBUG - Phase 2: Advanced API Tests', () => {
  const API_URL = process.env.API_URL || 'http://localhost:8001';
  let testEmail: string;
  let testPassword: string;
  let authToken: string;
  let chatbotId: string;
  let dataRecordId: string;

  beforeAll(async () => {
    testEmail = `test-${Date.now()}@example.com`;
    testPassword = 'TestPassword123!';

    console.log('\n========================================');
    console.log('🔍 DEBUG TEST PHASE 2 STARTED');
    console.log('========================================');
    console.log(`API_URL: ${API_URL}`);
    console.log('Setting up: Register → Confirm → Login → Create Chatbot');
    console.log('========================================\n');

    // Setup: Register user
    console.log('📝 Setup Step 1: Register user...');
    const registerResponse = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
        name: 'Debug Test User',
      }),
    });
    const registerData = await registerResponse.json();
    console.log(`✅ User registered: ${registerData.user.email}`);

    // Setup: Confirm user
    console.log('📝 Setup Step 2: Confirm user email...');
    await fetch(`${API_URL}/api/auth/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail }),
    });
    console.log('✅ User confirmed');

    // Setup: Login to get token
    console.log('📝 Setup Step 3: Login to get auth token...');
    const loginResponse = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: testPassword }),
    });
    const loginData = await loginResponse.json();

    // IMPORTANT: Use AccessToken (not IdToken) for API authentication
    // The auth middleware expects the AccessToken from Cognito
    authToken = loginData.accessToken;
    console.log(`✅ Auth token obtained (AccessToken): ${authToken.substring(0, 20)}...`);

    // Setup: Create a chatbot for testing
    console.log('📝 Setup Step 4: Create test chatbot...');
    const chatbotResponse = await fetch(`${API_URL}/api/chatbots`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        title: 'Test Chatbot for Phase 2',
        origin: 'https://example.com',
        language: 'en',
        indexName: `test-index-${Date.now()}`,
      }),
    });

    console.log(`Chatbot creation response status: ${chatbotResponse.status}`);
    const chatbotResponseText = await chatbotResponse.text();
    console.log(`Chatbot creation response body: ${chatbotResponseText}`);

    if (!chatbotResponse.ok) {
      throw new Error(`Failed to create test chatbot: ${chatbotResponseText}`);
    }

    const chatbotData = JSON.parse(chatbotResponseText);

    if (!chatbotData.chatbot || !chatbotData.chatbot.chatbotId) {
      throw new Error(`Invalid chatbot response structure: ${chatbotResponseText}`);
    }

    chatbotId = chatbotData.chatbot.chatbotId;
    console.log(`✅ Test chatbot created: ${chatbotId}`);

    console.log('\n========================================');
    console.log('✅ SETUP COMPLETE - Starting Tests');
    console.log('========================================\n');
  });

  /**
   * Test 1: Update Chatbot
   */
  test('1️⃣ Update Chatbot - Should update chatbot details', async () => {
    console.log('\n--- Test 1: Update Chatbot ---');
    console.log(`Making PUT request to: ${API_URL}/api/chatbots/${chatbotId}`);

    const updateData = {
      title: 'Updated Test Chatbot',
      origin: 'https://updated-example.com',
    };

    console.log('Update Data:', JSON.stringify(updateData, null, 2));

    try {
      const response = await fetch(`${API_URL}/api/chatbots/${chatbotId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(updateData),
      });

      console.log(`Response Status: ${response.status}`);
      const data = await response.json();
      console.log('Response:', JSON.stringify(data, null, 2));

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.chatbot.title).toBe(updateData.title);
      console.log('✅ Update chatbot test passed!');
    } catch (error: any) {
      console.error('❌ Test failed:', error.message);
      throw error;
    }
  });

  /**
   * Test 2: Get Single Chatbot
   */
  test('2️⃣ Get Single Chatbot - Should return chatbot details', async () => {
    console.log('\n--- Test 2: Get Single Chatbot ---');
    console.log(`Making GET request to: ${API_URL}/api/chatbots/${chatbotId}`);

    try {
      const response = await fetch(`${API_URL}/api/chatbots/${chatbotId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      console.log(`Response Status: ${response.status}`);
      const data = await response.json();
      console.log('Response:', JSON.stringify(data, null, 2));

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.chatbot.chatbotId).toBe(chatbotId);
      expect(data.chatbot.title).toBe('Updated Test Chatbot'); // From previous test
      console.log('✅ Get single chatbot test passed!');
    } catch (error: any) {
      console.error('❌ Test failed:', error.message);
      throw error;
    }
  });

  /**
   * Test 3: Get Customization
   */
  test('3️⃣ Get Customization - Should return chatbot customization', async () => {
    console.log('\n--- Test 3: Get Customization ---');
    console.log(`Making GET request to: ${API_URL}/api/customize/${chatbotId}`);

    try {
      const response = await fetch(`${API_URL}/api/customize/${chatbotId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      console.log(`Response Status: ${response.status}`);
      const data = await response.json();
      console.log('Response:', JSON.stringify(data, null, 2));

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.customization).toBeDefined();
      console.log('✅ Get customization test passed!');
    } catch (error: any) {
      console.error('❌ Test failed:', error.message);
      throw error;
    }
  });

  /**
   * Test 4: Update Customization
   */
  test('4️⃣ Update Customization - Should update chatbot theme', async () => {
    console.log('\n--- Test 4: Update Customization ---');
    console.log(`Making PUT request to: ${API_URL}/api/customize/${chatbotId}`);

    const customization = {
      colors: {
        primary: '#FF5733',
        secondary: '#33FF57',
      },
      welcomeMessage: 'Welcome to our test chatbot!',
      systemPrompt: 'You are a helpful assistant.',
      gptVersion: 'gpt-4',
    };

    console.log('Customization Data:', JSON.stringify(customization, null, 2));

    try {
      const response = await fetch(`${API_URL}/api/customize/${chatbotId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(customization),
      });

      console.log(`Response Status: ${response.status}`);
      const data = await response.json();
      console.log('Response:', JSON.stringify(data, null, 2));

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      console.log('✅ Update customization test passed!');
    } catch (error: any) {
      console.error('❌ Test failed:', error.message);
      throw error;
    }
  });

  /**
   * Test 5: Add Data Record
   */
  test('5️⃣ Add Data Record - Should add manual data to chatbot', async () => {
    console.log('\n--- Test 5: Add Data Record ---');
    console.log(`Making POST request to: ${API_URL}/api/data-store/${chatbotId}`);

    const dataRecord = {
      source: 'Manual Entry Test',
      type: 'manual',
      content: 'This is test content for the chatbot knowledge base.',
    };

    console.log('Data Record:', JSON.stringify(dataRecord, null, 2));

    try {
      const response = await fetch(`${API_URL}/api/data-store/${chatbotId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(dataRecord),
      });

      console.log(`Response Status: ${response.status}`);
      const data = await response.json();
      console.log('Response:', JSON.stringify(data, null, 2));

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.record).toBeDefined();

      // Save dataId for next test
      dataRecordId = data.record.dataId;
      console.log(`✅ Data record created with ID: ${dataRecordId}`);
    } catch (error: any) {
      console.error('❌ Test failed:', error.message);
      throw error;
    }
  });

  /**
   * Test 6: List Data Records
   */
  test('6️⃣ List Data Records - Should return all data records', async () => {
    console.log('\n--- Test 6: List Data Records ---');
    console.log(`Making GET request to: ${API_URL}/api/data-store/${chatbotId}`);

    try {
      const response = await fetch(`${API_URL}/api/data-store/${chatbotId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      console.log(`Response Status: ${response.status}`);
      const data = await response.json();
      console.log('Response:', JSON.stringify(data, null, 2));

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.records)).toBe(true);
      expect(data.records.length).toBeGreaterThan(0);

      // Verify our created record is in the list
      const foundRecord = data.records.find((r: any) => r.dataId === dataRecordId);
      expect(foundRecord).toBeDefined();
      console.log('✅ List data records test passed!');
    } catch (error: any) {
      console.error('❌ Test failed:', error.message);
      throw error;
    }
  });

  /**
   * Test 7: Get User Profile
   */
  test('7️⃣ Get User Profile - Should return user profile info', async () => {
    console.log('\n--- Test 7: Get User Profile ---');
    console.log(`Making GET request to: ${API_URL}/api/user/profile`);

    try {
      const response = await fetch(`${API_URL}/api/user/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      console.log(`Response Status: ${response.status}`);
      const data = await response.json();
      console.log('Response:', JSON.stringify(data, null, 2));

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.profile).toBeDefined();
      expect(data.profile.email).toBe(testEmail);
      expect(data.profile.tier).toBeDefined();
      console.log('✅ Get user profile test passed!');
    } catch (error: any) {
      console.error('❌ Test failed:', error.message);
      throw error;
    }
  });

  /**
   * Test 8: Get Quota
   */
  test('8️⃣ Get Quota - Should return user quota and usage', async () => {
    console.log('\n--- Test 8: Get Quota ---');
    console.log(`Making GET request to: ${API_URL}/api/quota`);

    try {
      const response = await fetch(`${API_URL}/api/quota`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      console.log(`Response Status: ${response.status}`);
      const data = await response.json();
      console.log('Response:', JSON.stringify(data, null, 2));

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.quota).toBeDefined();
      expect(data.quota.tier).toBeDefined();
      expect(data.quota.chat).toBeDefined();
      expect(data.quota.chat.quota).toBeDefined();
      expect(data.quota.chatbot).toBeDefined();
      console.log(`✅ Get quota test passed! Tier: ${data.quota.tier}, Chat quota: ${data.quota.chat.quota}`);
    } catch (error: any) {
      console.error('❌ Test failed:', error.message);
      throw error;
    }
  });

  /**
   * Test 9: Delete Chatbot
   */
  test('9️⃣ Delete Chatbot - Should delete the chatbot', async () => {
    console.log('\n--- Test 9: Delete Chatbot ---');
    console.log(`Making DELETE request to: ${API_URL}/api/chatbots/${chatbotId}`);

    try {
      const response = await fetch(`${API_URL}/api/chatbots/${chatbotId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      console.log(`Response Status: ${response.status}`);
      const data = await response.json();
      console.log('Response:', JSON.stringify(data, null, 2));

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      console.log('✅ Delete chatbot test passed!');

      // Verify deletion by trying to get it again
      console.log('Verifying deletion...');
      const verifyResponse = await fetch(`${API_URL}/api/chatbots/${chatbotId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      const verifyData = await verifyResponse.json();
      console.log('Verification Response:', JSON.stringify(verifyData, null, 2));

      expect(verifyResponse.status).toBe(404);
      console.log('✅ Deletion verified - chatbot not found');
    } catch (error: any) {
      console.error('❌ Test failed:', error.message);
      throw error;
    }
  });

  afterAll(() => {
    console.log('\n========================================');
    console.log('🔍 DEBUG TEST PHASE 2 COMPLETED');
    console.log('Summary:');
    console.log(`  - Email: ${testEmail}`);
    console.log(`  - Chatbot ID: ${chatbotId}`);
    console.log(`  - Data Record ID: ${dataRecordId || 'N/A'}`);
    console.log('  - All CRUD operations tested ✅');
    console.log('========================================\n');
  });
});
