/**
 * CLAWD SECURE - Encrypted Storage
 * Directive 3: Anti-Honeypot Data Encryption
 * 
 * Provides encrypted file I/O for all persistent data
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { encryptToJSON, decryptFromJSON } from './encryption.js';

// ============================================
// CONFIGURATION
// ============================================

let SECRET_KEY: string | undefined;
let DATA_DIR: string = './data';

/**
 * Initialize storage with encryption key
 * MUST be called before any storage operations
 */
export function initializeStorage(): void {
    SECRET_KEY = process.env.CLAWD_SECRET_KEY;

    if (!SECRET_KEY || SECRET_KEY.length < 32) {
        console.error('🚨 FATAL: CLAWD_SECRET_KEY is missing or too weak (min 32 chars).');
        console.error('   Run "npm run install:secure" to generate secure keys.');
        process.exit(1);
    }

    // Set data directory
    DATA_DIR = process.env.CLAWD_DATA_DIR || './data';

    console.log('✅ Encrypted storage initialized');
    console.log('   Data directory:', DATA_DIR);
}

/**
 * Ensures secret key is available
 */
function ensureKey(): string {
    if (!SECRET_KEY) {
        throw new Error('Storage not initialized. Call initializeStorage() first.');
    }
    return SECRET_KEY;
}

// ============================================
// FILE OPERATIONS
// ============================================

/**
 * Writes encrypted data to a file
 */
export async function writeEncrypted(
    filePath: string,
    data: string
): Promise<void> {
    const key = ensureKey();

    // Encrypt data
    const encrypted = encryptToJSON(data, key);

    // Ensure directory exists
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });

    // Write encrypted data
    const fullPath = filePath.endsWith('.enc') ? filePath : `${filePath}.enc`;
    await fs.writeFile(fullPath, encrypted, 'utf8');
}

/**
 * Reads and decrypts data from a file
 */
export async function readEncrypted(filePath: string): Promise<string> {
    const key = ensureKey();

    // Read encrypted data
    const fullPath = filePath.endsWith('.enc') ? filePath : `${filePath}.enc`;
    const encrypted = await fs.readFile(fullPath, 'utf8');

    // Decrypt and return
    return decryptFromJSON(encrypted, key);
}

/**
 * Writes encrypted JSON data to a file
 */
export async function writeEncryptedJSON<T>(
    filePath: string,
    data: T
): Promise<void> {
    const json = JSON.stringify(data, null, 2);
    await writeEncrypted(filePath, json);
}

/**
 * Reads and decrypts JSON data from a file
 */
export async function readEncryptedJSON<T>(filePath: string): Promise<T> {
    const json = await readEncrypted(filePath);
    return JSON.parse(json) as T;
}

/**
 * Checks if an encrypted file exists
 */
export async function encryptedFileExists(filePath: string): Promise<boolean> {
    const fullPath = filePath.endsWith('.enc') ? filePath : `${filePath}.enc`;
    try {
        await fs.access(fullPath);
        return true;
    } catch {
        return false;
    }
}

/**
 * Deletes an encrypted file
 */
export async function deleteEncrypted(filePath: string): Promise<void> {
    const fullPath = filePath.endsWith('.enc') ? filePath : `${filePath}.enc`;
    await fs.unlink(fullPath);
}

/**
 * Lists all encrypted files in a directory
 */
export async function listEncryptedFiles(dirPath: string): Promise<string[]> {
    try {
        const files = await fs.readdir(dirPath);
        return files.filter(f => f.endsWith('.enc'));
    } catch {
        return [];
    }
}

// ============================================
// CONVENIENCE EXPORTS
// ============================================

export { encryptToJSON, decryptFromJSON } from './encryption.js';
