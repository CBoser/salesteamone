import { Request, Response, NextFunction } from 'express';

/**
 * API Versioning Middleware
 *
 * Adds API version information to all responses
 * This allows clients to:
 * - Know which API version they're using
 * - Detect when new versions are available
 * - Track version changes in their logs
 *
 * Sprint 1 Day 9: Initial implementation (v1)
 */

/**
 * Version header middleware
 * Adds X-API-Version header to all responses
 */
export function apiVersionHeader(version: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-API-Version', version);
    next();
  };
}

/**
 * Version 1 middleware (current)
 */
export const v1VersionHeader = apiVersionHeader('v1');

/**
 * Future version middleware (placeholder)
 * Usage: export const v2VersionHeader = apiVersionHeader('v2');
 */
