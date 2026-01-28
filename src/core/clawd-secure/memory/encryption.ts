/**
 * CLAWD SECURE - Encryption Utilities
 * Directive 3: Anti-Honeypot Data Encryption
 * 
 * Implements AES-256-GCM authenticated encryption for all persistent data
 */

import crypto from 'node:crypto';

// ============================================
// CONSTANTS
// ============================================

const ALGORITHM = 'aes-256-gcm' as const;
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 12; // 96 bits (recommended for GCM)
const SALT_LENGTH = 32; // 256 bits
const AUTH_TAG_LENGTH = 16; // 128 bits
const PBKDF2_ITERATIONS = 100000;

// ============================================
// KEY DERIVATION
// ============================================

/**
 * Derives an encryption key from a password using PBKDF2
 */
export function deriveKey(password: string, salt: Buffer): Buffer {
    return crypto.pbkdf2Sync(
        password,
        salt,
        PBKDF2_ITERATIONS,
        KEY_LENGTH,
        'sha256'
    );
}

// ============================================
// ENCRYPTION
// ============================================

export interface EncryptedData {
    algorithm: string;
    iv: string; // base64
    salt: string; // base64
    authTag: string; // base64
    ciphertext: string; // base64
}

/**
 * Encrypts data using AES-256-GCM
 */
export function encrypt(plaintext: string, password: string): EncryptedData {
    // Generate random salt and IV
    const salt = crypto.randomBytes(SALT_LENGTH);
    const iv = crypto.randomBytes(IV_LENGTH);

    // Derive key from password
    const key = deriveKey(password, salt);

    // Create cipher
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    // Encrypt
    let ciphertext = cipher.update(plaintext, 'utf8', 'base64');
    ciphertext += cipher.final('base64');

    // Get authentication tag
    const authTag = cipher.getAuthTag();

    return {
        algorithm: ALGORITHM,
        iv: iv.toString('base64'),
        salt: salt.toString('base64'),
        authTag: authTag.toString('base64'),
        ciphertext,
    };
}

// ============================================
// DECRYPTION
// ============================================

/**
 * Decrypts data using AES-256-GCM
 * @throws Error if authentication fails (data was tampered with)
 */
export function decrypt(encrypted: EncryptedData, password: string): string {
    // Validate algorithm
    if (encrypted.algorithm !== ALGORITHM) {
        throw new Error(`Unsupported algorithm: ${encrypted.algorithm}`);
    }

    // Parse encrypted data
    const iv = Buffer.from(encrypted.iv, 'base64');
    const salt = Buffer.from(encrypted.salt, 'base64');
    const authTag = Buffer.from(encrypted.authTag, 'base64');

    // Derive key
    const key = deriveKey(password, salt);

    // Create decipher
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    // Decrypt
    try {
        let plaintext = decipher.update(encrypted.ciphertext, 'base64', 'utf8');
        plaintext += decipher.final('utf8');
        return plaintext;
    } catch (error) {
        throw new Error('Decryption failed: Data may have been tampered with');
    }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Encrypts and returns JSON-stringified encrypted data
 */
export function encryptToJSON(plaintext: string, password: string): string {
    const encrypted = encrypt(plaintext, password);
    return JSON.stringify(encrypted);
}

/**
 * Decrypts from JSON-stringified encrypted data
 */
export function decryptFromJSON(json: string, password: string): string {
    const encrypted = JSON.parse(json) as EncryptedData;
    return decrypt(encrypted, password);
}
