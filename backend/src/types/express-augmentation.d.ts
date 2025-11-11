/**
 * Express Module Augmentation for express-rate-limit v8
 *
 * This file augments the Express Request interface to include the rateLimit property
 * that is added by express-rate-limit middleware.
 *
 * NOTE: This is an ambient declaration and does not export anything.
 * The filename must NOT match the package name to avoid shadowing the import.
 */

// Make this file a module so we can use declare global
export {};

declare global {
  namespace Express {
    interface Request {
    /**
     * Rate limit information added by express-rate-limit middleware (v8+)
     *
     * This property is set by the middleware based on the requestPropertyName option
     * (defaults to 'rateLimit').
     */
    rateLimit?: {
      /**
       * Maximum number of requests allowed in the current window
       */
      limit: number;

      /**
       * Number of requests used in the current window
       */
      used: number;

      /**
       * Number of requests remaining in the window
       */
      remaining: number;

      /**
       * Date when the rate limit window resets
       */
      resetTime?: Date;

      /**
       * The key used to identify this client
       */
      key?: string;

      /**
       * @deprecated Use 'used' instead
       * Current number of requests (non-enumerable property)
       */
      current?: number;
    };
    }
  }
}
