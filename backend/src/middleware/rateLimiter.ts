/// <reference path="../types/express-augmentation.d.ts" />
import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

/**
 * Rate Limiting Middleware
 *
 * Protects the API from abuse by limiting the number of requests per IP address.
 * Different rate limits are applied to different endpoint types:
 * - Auth endpoints: Strict limits to prevent brute force attacks
 * - Registration: Very strict to prevent spam
 * - General API: Moderate limits for normal usage
 *
 * Security Benefits:
 * - Prevents brute force password attacks
 * - Prevents account enumeration
 * - Prevents spam registrations
 * - Prevents API abuse and DDoS
 * - Protects backend resources
 */

/**
 * Auth Rate Limiter
 *
 * Strict rate limiting for authentication endpoints (login, password reset, etc.)
 * Prevents brute force password attacks
 *
 * Limits: 5 requests per 15 minutes per IP
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: {
    error: 'Too many authentication attempts',
    message: 'Too many login attempts from this IP. Please try again in 15 minutes.',
    retryAfter: '15 minutes',
  },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers

  // Custom error handler
  handler: (req: Request, res: Response) => {
    const resetTime = req.rateLimit?.resetTime;
    const retryAfter = resetTime
      ? Math.ceil((resetTime.getTime() - Date.now()) / 1000)
      : 900; // Default to 15 minutes

    console.warn(`🚫 [rate-limit]: Auth rate limit exceeded - IP: ${req.ip || 'unknown'}`);

    res.status(429).json({
      success: false,
      error: 'Too many requests',
      message: 'Too many authentication attempts from this IP. Please try again later.',
      retryAfter: retryAfter,
      retryAfterMinutes: Math.ceil(retryAfter / 60),
    });
  },

  // Skip successful requests in some scenarios (optional)
  skipSuccessfulRequests: false, // Count all requests, successful or not

  // Skip failed requests (optional)
  skipFailedRequests: false, // Count all requests
});

/**
 * Registration Rate Limiter
 *
 * Very strict rate limiting for user registration
 * Prevents spam accounts and abuse
 *
 * Limits: 3 requests per 1 hour per IP
 */
export const registrationRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 registrations per hour per IP
  message: {
    error: 'Too many registration attempts',
    message: 'Too many registration attempts from this IP. Please try again in an hour.',
    retryAfter: '1 hour',
  },
  standardHeaders: true,
  legacyHeaders: false,

  handler: (req: Request, res: Response) => {
    const resetTime = req.rateLimit?.resetTime;
    const retryAfter = resetTime
      ? Math.ceil((resetTime.getTime() - Date.now()) / 1000)
      : 3600; // Default to 1 hour

    console.warn(`🚫 [rate-limit]: Registration rate limit exceeded - IP: ${req.ip || 'unknown'}`);

    res.status(429).json({
      success: false,
      error: 'Too many requests',
      message: 'Too many registration attempts from this IP. Please try again in an hour.',
      retryAfter: retryAfter,
      retryAfterHours: Math.ceil(retryAfter / 3600),
    });
  },
});

/**
 * General API Rate Limiter
 *
 * Moderate rate limiting for general API endpoints
 * Prevents API abuse while allowing legitimate usage
 *
 * Limits: 100 requests per 15 minutes per IP
 */
export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: {
    error: 'Too many requests',
    message: 'Too many API requests from this IP. Please try again in 15 minutes.',
    retryAfter: '15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,

  handler: (req: Request, res: Response) => {
    const resetTime = req.rateLimit?.resetTime;
    const retryAfter = resetTime
      ? Math.ceil((resetTime.getTime() - Date.now()) / 1000)
      : 900; // Default to 15 minutes

    console.warn(`🚫 [rate-limit]: API rate limit exceeded - IP: ${req.ip || 'unknown'} - Path: ${req.path}`);

    res.status(429).json({
      success: false,
      error: 'Too many requests',
      message: 'Too many API requests from this IP. Please try again later.',
      retryAfter: retryAfter,
      retryAfterMinutes: Math.ceil(retryAfter / 60),
    });
  },

  // Skip certain paths (optional)
  skip: (req: Request) => {
    // Don't rate limit health check endpoint
    return req.path === '/health';
  },
});

/**
 * Password Reset Rate Limiter
 *
 * Strict rate limiting for password reset requests
 * Prevents password reset spam and enumeration attacks
 *
 * Limits: 3 requests per 1 hour per IP
 */
export const passwordResetRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 password reset requests per hour
  message: {
    error: 'Too many password reset attempts',
    message: 'Too many password reset requests. Please try again in an hour.',
    retryAfter: '1 hour',
  },
  standardHeaders: true,
  legacyHeaders: false,

  handler: (req: Request, res: Response) => {
    const resetTime = req.rateLimit?.resetTime;
    const retryAfter = resetTime
      ? Math.ceil((resetTime.getTime() - Date.now()) / 1000)
      : 3600; // Default to 1 hour

    console.warn(`🚫 [rate-limit]: Password reset rate limit exceeded - IP: ${req.ip || 'unknown'}`);

    res.status(429).json({
      success: false,
      error: 'Too many requests',
      message: 'Too many password reset requests from this IP. Please try again in an hour.',
      retryAfter: retryAfter,
      retryAfterHours: Math.ceil(retryAfter / 3600),
    });
  },
});

/**
 * Admin API Rate Limiter
 *
 * Higher limits for admin operations (can be adjusted based on needs)
 *
 * Limits: 200 requests per 15 minutes per IP
 */
export const adminRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // 200 requests per window (higher than general API)
  message: {
    error: 'Too many requests',
    message: 'Too many admin API requests. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,

  handler: (req: Request, res: Response) => {
    const resetTime = req.rateLimit?.resetTime;
    const retryAfter = resetTime
      ? Math.ceil((resetTime.getTime() - Date.now()) / 1000)
      : 900;

    console.warn(`🚫 [rate-limit]: Admin API rate limit exceeded - IP: ${req.ip || 'unknown'} - User: ${req.user?.userId || 'unknown'}`);

    res.status(429).json({
      success: false,
      error: 'Too many requests',
      message: 'Too many admin API requests. Please try again later.',
      retryAfter: retryAfter,
      retryAfterMinutes: Math.ceil(retryAfter / 60),
    });
  },
});

/**
 * Rate Limit Configuration Summary
 *
 * | Limiter              | Window  | Max Requests | Use Case                           |
 * |----------------------|---------|--------------|-------------------------------------|
 * | authRateLimiter      | 15 min  | 5            | Login, logout (brute force protect)|
 * | registrationRateLimiter | 1 hour | 3         | User registration (spam protection) |
 * | passwordResetRateLimiter | 1 hour | 3        | Password reset (abuse protection)   |
 * | apiRateLimiter       | 15 min  | 100          | General API endpoints               |
 * | adminRateLimiter     | 15 min  | 200          | Admin operations (higher limits)    |
 *
 * Response Headers (standardHeaders: true):
 * - RateLimit-Limit: Maximum requests allowed in window
 * - RateLimit-Remaining: Requests remaining in current window
 * - RateLimit-Reset: Timestamp when the window resets
 *
 * Error Response (429 Too Many Requests):
 * {
 *   "success": false,
 *   "error": "Too many requests",
 *   "message": "...",
 *   "retryAfter": 900,
 *   "retryAfterMinutes": 15
 * }
 */
