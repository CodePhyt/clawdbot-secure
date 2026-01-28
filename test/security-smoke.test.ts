/**
 * CLAWD SECURE - SMOKE TESTS
 * Adapted for Moltbot integration
 * 
 * Verifies that Clawd Secure directives are active
 */

import http from 'node:http';
import fs from 'node:fs';
import { initializeStorage, writeEncrypted, readEncrypted } from '../src/core/clawd-secure/memory/storage.js';

// ============================================
// CONFIGURATION
// ============================================

const BASE_URL = process.env.TEST_BASE_URL || 'http://127.0.0.1:3000';
const GATEWAY_TOKEN = process.env.X_GATEWAY_TOKEN || '';

let passedTests = 0;
let failedTests = 0;

// ============================================
// COLORS
// ============================================

const COLORS = {
    GREEN: '\x1b[32m',
    RED: '\x1b[31m',
    YELLOW: '\x1b[33m',
    BLUE: '\x1b[34m',
    RESET: '\x1b[0m'
};

function log(message: string, color: string = COLORS.RESET): void {
    console.log(`${color}${message}${COLORS.RESET}`);
}

function logTest(name: string): void {
    log(`\n[TEST] ${name}`, COLORS.BLUE);
}

function logPass(message: string): void {
    passedTests++;
    log(`  ✓ ${message}`, COLORS.GREEN);
}

function logFail(message: string): void {
    failedTests++;
    log(`  ✗ ${message}`, COLORS.RED);
}

// ============================================
// HTTP REQUEST HELPER
// ============================================

function makeRequest(
    path: string,
    method: string = 'GET',
    headers: Record<string, string> = {}
): Promise<{ statusCode: number; body: string }> {
    return new Promise((resolve, reject) => {
        const url = new URL(path, BASE_URL);

        const options = {
            method,
            hostname: url.hostname,
            port: url.port,
            path: url.pathname,
            headers: {
                'Content-Type': 'application/json',
                ...headers
            }
        };

        const req = http.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                resolve({
                    statusCode: res.statusCode || 0,
                    body: data
                });
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.end();
    });
}

// ============================================
// TEST 1: AUTHENTICATION
// ============================================

async function testAuthentication(): Promise<void> {
    logTest('Directive 1: Network Fortress & Authentication');

    try {
        // Test 1a: Request without token (MUST FAIL)
        const noTokenResponse = await makeRequest('/health');

        if (noTokenResponse.statusCode === 401) {
            logPass('Requests without token are rejected (401)');
        } else {
            logFail(`Expected 401, got ${noTokenResponse.statusCode}`);
        }

        // Test 1b: Request with invalid token (MUST FAIL)
        const badTokenResponse = await makeRequest('/health', 'GET', {
            'X-GATEWAY-TOKEN': 'invalid-token-12345'
        });

        if (badTokenResponse.statusCode === 401) {
            logPass('Requests with invalid token are rejected (401)');
        } else {
            logFail(`Expected 401, got ${badTokenResponse.statusCode}`);
        }

        // Test 1c: Request with valid token (MUST SUCCEED)
        if (!GATEWAY_TOKEN) {
            logFail('X_GATEWAY_TOKEN not set in environment');
            return;
        }

        const validTokenResponse = await makeRequest('/health', 'GET', {
            'X-GATEWAY-TOKEN': GATEWAY_TOKEN
        });

        if (validTokenResponse.statusCode === 200) {
            logPass('Requests with valid token are accepted (200)');
        } else {
            logFail(`Expected 200, got ${validTokenResponse.statusCode}`);
        }

    } catch (error) {
        logFail(`Authentication test error: ${error}`);
    }
}

// ============================================
// TEST 2: ENCRYPTION
// ============================================

async function testEncryption(): Promise<void> {
    logTest('Directive 3: Anti-Honeypot Data Encryption');

    const testFilePath = './data/smoke-test-data.txt';
    const plaintextSecret = 'This is a secret message: DO NOT STORE IN PLAINTEXT!';

    try {
        // Initialize storage
        initializeStorage();
        logPass('Encryption system initialized');

        // Write encrypted data
        await writeEncrypted(testFilePath, plaintextSecret);
        logPass('Data written with encryption');

        // Check that file on disk is NOT plaintext
        const encryptedFilePath = testFilePath + '.enc';
        const diskContent = fs.readFileSync(encryptedFilePath, 'utf8');

        if (diskContent.includes(plaintextSecret)) {
            logFail('CRITICAL: Data is stored in PLAINTEXT on disk!');
        } else {
            logPass('Data is encrypted on disk (not plaintext)');
        }

        // Verify it's valid JSON encrypted format
        try {
            const parsed = JSON.parse(diskContent);
            if (parsed.algorithm === 'aes-256-gcm' && parsed.ciphertext) {
                logPass('Encrypted format is valid AES-256-GCM');
            } else {
                logFail('Invalid encrypted format');
            }
        } catch {
            logFail('Encrypted file is not valid JSON');
        }

        // Read and decrypt
        const decrypted = await readEncrypted(testFilePath);

        if (decrypted === plaintextSecret) {
            logPass('Data decrypts correctly');
        } else {
            logFail('Decryption returned wrong data');
        }

        // Cleanup
        fs.unlinkSync(encryptedFilePath);
        logPass('Test cleanup completed');

    } catch (error) {
        logFail(`Encryption test error: ${error}`);
    }
}

// ============================================
// MAIN TEST RUNNER
// ============================================

async function runSmokeTests(): Promise<void> {
    log('\n============================================================', COLORS.BLUE);
    log('🧪 CLAWD SECURE - MOLTBOT SMOKE TESTS', COLORS.BLUE);
    log('============================================================\n', COLORS.BLUE);

    // Validate environment
    if (!GATEWAY_TOKEN) {
        log('⚠️  WARNING: X_GATEWAY_TOKEN not set in environment', COLORS.YELLOW);
        log('   Some tests will be skipped\n', COLORS.YELLOW);
    }

    // Run test suites
    await testAuthentication();
    await testEncryption();

    // Summary
    log('\n============================================================', COLORS.BLUE);
    log('TEST SUMMARY', COLORS.BLUE);
    log('============================================================\n', COLORS.BLUE);

    const totalTests = passedTests + failedTests;
    log(`Total Tests: ${totalTests}`, COLORS.BLUE);
    log(`Passed: ${passedTests}`, COLORS.GREEN);
    log(`Failed: ${failedTests}`, failedTests > 0 ? COLORS.RED : COLORS.GREEN);

    if (failedTests === 0) {
        log('\n✅ ALL TESTS PASSED - Clawd Secure is active!\n', COLORS.GREEN);
        process.exit(0);
    } else {
        log('\n❌ SOME TESTS FAILED - Review errors above\n', COLORS.RED);
        process.exit(1);
    }
}

// Run tests
runSmokeTests().catch((error) => {
    log(`\n❌ Test suite crashed: ${error}\n`, COLORS.RED);
    process.exit(1);
});
