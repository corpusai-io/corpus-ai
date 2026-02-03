/**
 * DEBUG TEST - Phase 3: Additional Endpoints
 * Tests: Data Store delete/update, Leads, Payment Plans, User Profile
 */

describe('🔍 DEBUG - Phase 3: Additional Endpoints', () => {
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
    console.log('🔍 DEBUG TEST PHASE 3 STARTED');
    console.log('========================================');
    console.log('Testing: Data Store, Leads, Payments, User Profile');
    console.log('========================================\n');

    // Setup: Register, Confirm, Login, Create Chatbot, Add Data Record
    console.log('📝 Setup: Quick setup...');

    // Register
    const registerResponse = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
        name: 'Phase 3 Test User',
      }),
    });
    await registerResponse.json();

    // Confirm
    await fetch(`${API_URL}/api/auth/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail }),
    });

    // Login
    const loginResponse = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: testPassword }),
    });
    const loginData = await loginResponse.json();
    authToken = loginData.accessToken;

    // Create chatbot
    const chatbotResponse = await fetch(`${API_URL}/api/chatbots`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        title: 'Phase 3 Test Chatbot',
        origin: 'https://example.com',
        language: 'en',
        indexName: `test-index-${Date.now()}`,
      }),
    });
    const chatbotData = await chatbotResponse.json();
    chatbotId = chatbotData.chatbot.chatbotId;

    // Add a data record for testing
    const dataResponse = await fetch(`${API_URL}/api/data-store/${chatbotId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        source: 'Test Data for Phase 3',
        type: 'manual',
        content: 'Original content',
      }),
    });
    const dataData = await dataResponse.json();
    dataRecordId = dataData.record.dataId;

    console.log(`✅ Setup complete: Chatbot ${chatbotId}, Data ${dataRecordId}\n`);
  });

  /**
   * Test 1: Update Data Record
   */
  test('1️⃣ Update Data Record - Should update existing data', async () => {
    console.log('\n--- Test 1: Update Data Record ---');
    console.log(`Making PUT request to: ${API_URL}/api/data-store/${chatbotId}/${dataRecordId}`);

    const updateData = {
      source: 'Updated Test Data',
      content: 'Updated content for testing',
    };

    console.log('Update Data:', JSON.stringify(updateData, null, 2));

    try {
      const response = await fetch(`${API_URL}/api/data-store/${chatbotId}/${dataRecordId}`, {
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
      console.log('✅ Update data record test passed!');
    } catch (error: any) {
      console.error('❌ Test failed:', error.message);
      throw error;
    }
  });

  /**
   * Test 2: Delete Data Record
   */
  test('2️⃣ Delete Data Record - Should delete the data record', async () => {
    console.log('\n--- Test 2: Delete Data Record ---');
    console.log(`Making DELETE request to: ${API_URL}/api/data-store/${chatbotId}/${dataRecordId}`);

    try {
      const response = await fetch(`${API_URL}/api/data-store/${chatbotId}/${dataRecordId}`, {
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
      console.log('✅ Delete data record test passed!');
    } catch (error: any) {
      console.error('❌ Test failed:', error.message);
      throw error;
    }
  });

  /**
   * Test 3: Get Lead Form Fields
   */
  test('3️⃣ Get Lead Form Fields - Should return form configuration', async () => {
    console.log('\n--- Test 3: Get Lead Form Fields ---');
    console.log(`Making GET request to: ${API_URL}/api/leads/${chatbotId}/fields`);

    try {
      const response = await fetch(`${API_URL}/api/leads/${chatbotId}/fields`, {
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
      expect(data.fields).toBeDefined();
      expect(Array.isArray(data.fields.fields)).toBe(true);
      console.log('✅ Get lead form fields test passed!');
    } catch (error: any) {
      console.error('❌ Test failed:', error.message);
      throw error;
    }
  });

  /**
   * Test 4: Update Lead Form Fields
   */
  test('4️⃣ Update Lead Form Fields - Should update form configuration', async () => {
    console.log('\n--- Test 4: Update Lead Form Fields ---');
    console.log(`Making PUT request to: ${API_URL}/api/leads/${chatbotId}/fields`);

    const formFields = [
      {
        key: 'name',
        name: 'Full Name',
        type: 'text',
        required: true,
      },
      {
        key: 'email',
        name: 'Email Address',
        type: 'email',
        required: true,
      },
      {
        key: 'company',
        name: 'Company',
        type: 'text',
        required: false,
      },
    ];

    console.log('Form Fields:', JSON.stringify(formFields, null, 2));

    try {
      const response = await fetch(`${API_URL}/api/leads/${chatbotId}/fields`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({ fields: formFields }),
      });

      console.log(`Response Status: ${response.status}`);
      const data = await response.json();
      console.log('Response:', JSON.stringify(data, null, 2));

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      console.log('✅ Update lead form fields test passed!');
    } catch (error: any) {
      console.error('❌ Test failed:', error.message);
      throw error;
    }
  });

  /**
   * Test 5: Add Lead (Public Endpoint - No Auth)
   */
  test('5️⃣ Add Lead - Should submit lead without authentication', async () => {
    console.log('\n--- Test 5: Add Lead (PUBLIC) ---');
    console.log(`Making POST request to: ${API_URL}/api/leads/${chatbotId}`);
    console.log('⚠️  Note: This is a PUBLIC endpoint (no auth required)');

    const leadData = {
      name: 'John Doe',
      email: 'john.doe@example.com',
      company: 'Test Company Inc.',
    };

    console.log('Lead Data:', JSON.stringify(leadData, null, 2));

    try {
      const response = await fetch(`${API_URL}/api/leads/${chatbotId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // NO Authorization header - public endpoint
        },
        body: JSON.stringify(leadData),
      });

      console.log(`Response Status: ${response.status}`);
      const data = await response.json();
      console.log('Response:', JSON.stringify(data, null, 2));

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.lead).toBeDefined();
      console.log('✅ Add lead test passed!');
    } catch (error: any) {
      console.error('❌ Test failed:', error.message);
      throw error;
    }
  });

  /**
   * Test 6: List Leads
   */
  test('6️⃣ List Leads - Should return all leads for chatbot', async () => {
    console.log('\n--- Test 6: List Leads ---');
    console.log(`Making GET request to: ${API_URL}/api/leads/${chatbotId}`);

    try {
      const response = await fetch(`${API_URL}/api/leads/${chatbotId}`, {
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
      expect(Array.isArray(data.leads)).toBe(true);
      expect(data.leads.length).toBeGreaterThan(0); // We added one in test 5
      console.log(`✅ List leads test passed! Found ${data.leads.length} lead(s)`);
    } catch (error: any) {
      console.error('❌ Test failed:', error.message);
      throw error;
    }
  });

  /**
   * Test 7: Get Pricing Plans (Public Endpoint)
   */
  test('7️⃣ Get Pricing Plans - Should return all pricing tiers', async () => {
    console.log('\n--- Test 7: Get Pricing Plans (PUBLIC) ---');
    console.log(`Making GET request to: ${API_URL}/api/payment/plans`);
    console.log('⚠️  Note: This is a PUBLIC endpoint (no auth required)');

    try {
      const response = await fetch(`${API_URL}/api/payment/plans`, {
        method: 'GET',
        // NO Authorization header - public endpoint
      });

      console.log(`Response Status: ${response.status}`);
      const data = await response.json();
      console.log('Response:', JSON.stringify(data, null, 2));

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.plans)).toBe(true);
      expect(data.plans.length).toBeGreaterThan(0);

      // Verify plan structure
      const firstPlan = data.plans[0];
      expect(firstPlan.id).toBeDefined();
      expect(firstPlan.name).toBeDefined();
      expect(firstPlan.tier).toBeDefined();

      console.log(`✅ Get pricing plans test passed! Found ${data.plans.length} plan(s)`);
    } catch (error: any) {
      console.error('❌ Test failed:', error.message);
      throw error;
    }
  });

  /**
   * Test 8: Update User Profile
   */
  test('8️⃣ Update User Profile - Should update user information', async () => {
    console.log('\n--- Test 8: Update User Profile ---');
    console.log(`Making PUT request to: ${API_URL}/api/user/profile`);

    const profileUpdates = {
      name: 'Updated Test User',
      picture: 'https://example.com/avatar.jpg',
    };

    console.log('Profile Updates:', JSON.stringify(profileUpdates, null, 2));

    try {
      const response = await fetch(`${API_URL}/api/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(profileUpdates),
      });

      console.log(`Response Status: ${response.status}`);
      const data = await response.json();
      console.log('Response:', JSON.stringify(data, null, 2));

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBeDefined();
      // Note: API returns success message only, not the updated profile
      console.log('✅ Update user profile test passed!');
    } catch (error: any) {
      console.error('❌ Test failed:', error.message);
      throw error;
    }
  });

  afterAll(async () => {
    // Cleanup: Delete the test chatbot
    console.log('\n📝 Cleanup: Deleting test chatbot...');
    try {
      await fetch(`${API_URL}/api/chatbots/${chatbotId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });
      console.log('✅ Cleanup complete');
    } catch (error) {
      console.log('⚠️  Cleanup failed (this is okay)');
    }

    console.log('\n========================================');
    console.log('🔍 DEBUG TEST PHASE 3 COMPLETED');
    console.log('Summary:');
    console.log(`  - Email: ${testEmail}`);
    console.log(`  - Chatbot ID: ${chatbotId}`);
    console.log('  - Tested: Data Store, Leads, Payments, Profile');
    console.log('========================================\n');
  });
});
