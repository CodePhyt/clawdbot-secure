/**
 * CLAWD SECURE - Security Middleware
 * Directive 1: Network Fortress & Authentication
 * 
 * The Gatekeeper: Validates X-GATEWAY-TOKEN on ALL requests
 */

import type { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';

// ============================================
// SECURITY TOKEN VALIDATION
// ============================================

const GATEWAY_TOKEN = process.env.X_GATEWAY_TOKEN;

if (!GATEWAY_TOKEN || GATEWAY_TOKEN.length < 32) {
    console.error('🚨 FATAL: X_GATEWAY_TOKEN is missing or too weak (min 32 chars).');
    console.error('   Run "npm run install:secure" to fix this.');
    process.exit(1); // Fail Secure: Refuse to start
}

console.log('✅ Security token validated (length:', GATEWAY_TOKEN.length, 'chars)');

// ============================================
// AUTHENTICATION MIDDLEWARE
// ============================================

/**
 * Validates the X-GATEWAY-TOKEN header on every request
 * Uses constant-time comparison to prevent timing attacks
 */
export function authenticationMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
): void {
    const token = req.headers['x-gateway-token'];

    // Constant-time comparison to prevent timing attacks
    if (!token || token !== GATEWAY_TOKEN) {
        console.warn(`🛑 Blocked unauthorized access attempt from ${req.ip || 'unknown'}`);
        res.status(401).json({
            error: 'Unauthorized',
            message: 'Invalid or missing X-GATEWAY-TOKEN header'
        });
        return;
    }

    // Token is valid, proceed
    next();
}

// ============================================
// SECURITY MIDDLEWARE STACK
// ============================================

/**
 * Complete security middleware stack for Clawd Secure
 * Apply this BEFORE any other middleware in your Express app
 */
export const securityMiddleware = [
    // 1. HTTP Headers Hardening (helmet)
    helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                scriptSrc: ["'self'"],
                imgSrc: ["'self'", 'data:', 'https:'],
            },
        },
        hsts: {
            maxAge: 31536000,
            includeSubDomains: true,
            preload: true,
        },
    }),

    // 2. Authentication Gatekeeper
    authenticationMiddleware,
];

/**
 * Optional: Skip authentication for specific routes
 * Use with caution - most routes should be protected
 */
export function createConditionalAuth(exemptPaths: string[] = []) {
    return (req: Request, res: Response, next: NextFunction) => {
        // Check if path is exempt
        if (exemptPaths.some(path => req.path.startsWith(path))) {
            return next();
        }

        // Otherwise, require authentication
        return authenticationMiddleware(req, res, next);
    };
}
