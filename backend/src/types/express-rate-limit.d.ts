// Type declarations for express-rate-limit middleware
// Adds rateLimit property to Express Request objects

import 'express';

declare module 'express-serve-static-core' {
  interface Request {
    rateLimit?: {
      limit: number;
      current: number;
      remaining: number;
      resetTime?: Date;
    };
  }
}
