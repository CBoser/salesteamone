/**
 * Security Headers Middleware
 *
 * Implements comprehensive HTTP security headers using Helmet.js
 * Protects against common web vulnerabilities:
 * - XSS (Cross-Site Scripting)
 * - Clickjacking
 * - MIME-type sniffing
 * - Downgrade attacks
 *
 * Sprint 1 - Day 3: Security Foundation
 */

import helmet from 'helmet';
import { Request, Response, NextFunction } from 'express';

/**
 * Main security headers middleware using Helmet
 *
 * Configures:
 * - Content Security Policy (CSP)
 * - HTTP Strict Transport Security (HSTS)
 * - X-Frame-Options (Clickjacking protection)
 * - X-Content-Type-Options (MIME sniffing protection)
 * - X-XSS-Protection (Legacy XSS protection)
 * - Referrer-Policy
 */
export const securityHeaders = helmet({
  // Content Security Policy - Prevents XSS and data injection attacks
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      // TEMPORARY: Allow unsafe-inline for development
      // TODO Sprint 3: Remove unsafe-inline and implement nonce-based CSP
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
      // Allow form submissions to self only
      formAction: ["'self'"],
      // Disable legacy features
      frameAncestors: ["'none'"],
      baseUri: ["'self'"],
    },
  },

  // HTTP Strict Transport Security - Forces HTTPS
  hsts: {
    maxAge: 31536000, // 1 year in seconds
    includeSubDomains: true,
    preload: true, // Allow inclusion in browser HSTS preload lists
  },

  // X-Frame-Options - Prevents clickjacking
  frameguard: {
    action: 'deny', // Don't allow framing at all
  },

  // X-Content-Type-Options - Prevents MIME-type sniffing
  noSniff: true,

  // X-XSS-Protection - Legacy XSS protection for older browsers
  // Modern browsers use CSP instead, but this helps older browsers
  xssFilter: true,

  // Referrer-Policy - Controls how much referrer information is shared
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin',
  },

  // Hide X-Powered-By header (don't advertise using Express)
  hidePoweredBy: true,

  // DNS Prefetch Control - Disable DNS prefetching for privacy
  dnsPrefetchControl: {
    allow: false,
  },

  // Download Options - Prevents opening downloads in IE
  ieNoOpen: true,
});

/**
 * Add API version header to all responses
 * Helps with API versioning and debugging
 */
export const apiVersionHeader = (req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-API-Version', 'v1');
  next();
};

/**
 * Add custom security header showing security policy compliance
 * Helps with auditing and compliance
 */
export const securityPolicyHeader = (req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Security-Policy', 'strict');
  next();
};

/**
 * Combined security middleware
 * Apply all security headers in correct order
 */
export const applySecurityMiddleware = [
  securityHeaders,
  apiVersionHeader,
  securityPolicyHeader,
];
