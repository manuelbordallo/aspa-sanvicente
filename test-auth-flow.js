/**
 * Test script for login and authorization flow
 * Tests the complete flow with both regular user and admin
 */

const API_BASE_URL = 'http://localhost:3000';

// Test users
const REGULAR_USER = {
    email: 'juan.garcia@example.com',
    password: 'User123'
};

const ADMIN_USER = {
    email: 'admin@aspa-sanvicente.com',
    password: 'Admin123'
};

// Helper function to make API requests
async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        }
    });

    const data = await response.json();
    return { status: response.status, data };
}

// Test login
async function testLogin(user, userType) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Testing login for ${userType}`);
    console.log(`${'='.repeat(60)}`);

    try {
        const { status, data } = await apiRequest('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify(user)
        });

        console.log(`Response status: ${status}`);
        console.log(`Response data:`, JSON.stringify(data, null, 2));

        if (status === 200 && data.success) {
            console.log(`✓ Login successful for ${userType}`);

            // Extract user data - handle different response structures
            const userData = data.data?.user || data.user;
            const token = data.data?.token || data.token;

            if (userData && token) {
                console.log(`  User ID: ${userData.id}`);
                console.log(`  Email: ${userData.email}`);
                console.log(`  Role: ${userData.role}`);
                console.log(`  Role type: ${typeof userData.role}`);

                // Check if role is lowercase
                if (userData.role === userData.role.toLowerCase()) {
                    console.log(`✓ Role is correctly normalized to lowercase`);
                } else {
                    console.log(`✗ ERROR: Role is not lowercase! Got: ${userData.role}`);
                }

                return { success: true, token, user: userData };
            } else {
                console.log(`✗ ERROR: Missing user data or token in response`);
                return { success: false };
            }
        } else {
            console.log(`✗ Login failed for ${userType}`);
            console.log(`  Status: ${status}`);
            console.log(`  Error: ${JSON.stringify(data)}`);
            return { success: false };
        }
    } catch (error) {
        console.log(`✗ Login error for ${userType}: ${error.message}`);
        console.log(`  Stack: ${error.stack}`);
        return { success: false };
    }
}

// Test token validation
async function testTokenValidation(token, userType) {
    console.log(`\nTesting token validation for ${userType}...`);

    try {
        const { status, data } = await apiRequest('/api/auth/validate', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        console.log(`Validation response:`, JSON.stringify(data, null, 2));

        if (status === 200 && data.success) {
            console.log(`✓ Token validation successful`);

            const userData = data.data?.user || data.user;
            if (userData) {
                console.log(`  Role from validation: ${userData.role}`);

                // Check if role is lowercase
                if (userData.role === userData.role.toLowerCase()) {
                    console.log(`✓ Role from validation is correctly normalized to lowercase`);
                } else {
                    console.log(`✗ ERROR: Role from validation is not lowercase! Got: ${userData.role}`);
                }

                return { success: true, user: userData };
            }
        }

        console.log(`✗ Token validation failed`);
        console.log(`  Status: ${status}`);
        return { success: false };
    } catch (error) {
        console.log(`✗ Token validation error: ${error.message}`);
        return { success: false };
    }
}

// Main test function
async function runTests() {
    console.log('\n' + '='.repeat(60));
    console.log('ASPA San Vicente - Login and Authorization Flow Test');
    console.log('='.repeat(60));

    let allTestsPassed = true;

    // Test 1: Regular user login
    const regularUserResult = await testLogin(REGULAR_USER, 'Regular User');
    if (!regularUserResult.success) {
        allTestsPassed = false;
    } else {
        // Validate token for regular user
        const regularUserValidation = await testTokenValidation(regularUserResult.token, 'Regular User');
        if (!regularUserValidation.success) {
            allTestsPassed = false;
        }

        // Check expected role
        if (regularUserResult.user.role === 'user') {
            console.log(`✓ Regular user has correct role: 'user'`);
        } else {
            console.log(`✗ ERROR: Regular user has incorrect role: '${regularUserResult.user.role}'`);
            allTestsPassed = false;
        }
    }

    // Test 2: Admin user login
    const adminUserResult = await testLogin(ADMIN_USER, 'Admin User');
    if (!adminUserResult.success) {
        allTestsPassed = false;
    } else {
        // Validate token for admin user
        const adminUserValidation = await testTokenValidation(adminUserResult.token, 'Admin User');
        if (!adminUserValidation.success) {
            allTestsPassed = false;
        }

        // Check expected role
        if (adminUserResult.user.role === 'admin') {
            console.log(`✓ Admin user has correct role: 'admin'`);
        } else {
            console.log(`✗ ERROR: Admin user has incorrect role: '${adminUserResult.user.role}'`);
            allTestsPassed = false;
        }
    }

    // Summary
    console.log(`\n${'='.repeat(60)}`);
    console.log('Test Summary');
    console.log(`${'='.repeat(60)}`);

    if (allTestsPassed) {
        console.log('✓ All tests passed!');
        console.log('✓ Roles are correctly normalized to lowercase');
        console.log('✓ Login and token validation work correctly');
        console.log('\nNext steps:');
        console.log('1. Open http://localhost:5173 in your browser');
        console.log('2. Login with juan.garcia@example.com / User123');
        console.log('3. Verify you can access: news, notices, calendar, settings, profile');
        console.log('4. Verify you CANNOT access: users view');
        console.log('5. Verify no "Acceso Denegado" error appears');
        console.log('6. Check browser console for role information');
        console.log('7. Logout and login with admin@aspa-sanvicente.com / Admin123');
        console.log('8. Verify you can access ALL views including users');
        process.exit(0);
    } else {
        console.log('✗ Some tests failed');
        console.log('Please review the errors above');
        process.exit(1);
    }
}

// Run the tests
runTests().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
