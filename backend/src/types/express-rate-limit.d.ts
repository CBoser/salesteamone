/**
 * TypeScript Declaration for express-rate-limit
 *
 * Extends the Express Request interface to include the rateLimit property
 * added by the express-rate-limit middleware.
 */

import 'express';

declare module 'express' {
  export interface Request {
    /**
     * Rate limit information added by express-rate-limit middleware
     */
    rateLimit?: {
      /**
       * Maximum number of requests allowed in the current window
       */
      limit: number;
      /**
       * Current count of requests in the window
       */
      current: number;
      /**
       * Number of requests remaining in the window
       */
      remaining: number;
      /**
       * Date when the rate limit window resets
       */
      resetTime: Date | undefined;
    };
  }
}
