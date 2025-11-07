import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import {
  CustomerNotFoundError,
  CustomerHasDependenciesError,
  InvalidCustomerDataError,
  CustomerContactNotFoundError,
  CustomerPricingTierNotFoundError,
  CustomerExternalIdNotFoundError,
  DuplicateExternalIdError,
} from '../errors/customer';

/**
 * Error response interface
 */
interface ErrorResponse {
  success: false;
  error: string;
  details?: any;
  statusCode: number;
}

/**
 * Global error handling middleware
 * Catches all errors and formats them into consistent JSON responses
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log error for debugging (use proper logger in production)
  console.error('Error:', {
    name: err.name,
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
  });

  // Default error response
  let errorResponse: ErrorResponse = {
    success: false,
    error: 'Internal server error',
    statusCode: 500,
  };

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    errorResponse = {
      success: false,
      error: 'Validation failed',
      details: err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
      statusCode: 400,
    };
  }

  // Handle Customer-specific errors
  else if (err instanceof CustomerNotFoundError) {
    errorResponse = {
      success: false,
      error: err.message,
      statusCode: 404,
    };
  } else if (err instanceof CustomerContactNotFoundError) {
    errorResponse = {
      success: false,
      error: err.message,
      statusCode: 404,
    };
  } else if (err instanceof CustomerPricingTierNotFoundError) {
    errorResponse = {
      success: false,
      error: err.message,
      statusCode: 404,
    };
  } else if (err instanceof CustomerExternalIdNotFoundError) {
    errorResponse = {
      success: false,
      error: err.message,
      statusCode: 404,
    };
  } else if (err instanceof CustomerHasDependenciesError) {
    errorResponse = {
      success: false,
      error: err.message,
      statusCode: 409, // Conflict
    };
  } else if (err instanceof InvalidCustomerDataError) {
    errorResponse = {
      success: false,
      error: err.message,
      details: (err as any).errors,
      statusCode: 400,
    };
  } else if (err instanceof DuplicateExternalIdError) {
    errorResponse = {
      success: false,
      error: err.message,
      statusCode: 409, // Conflict
    };
  }

  // Handle authentication errors
  else if (err.name === 'UnauthorizedError' || err.message.includes('token')) {
    errorResponse = {
      success: false,
      error: 'Unauthorized - Invalid or missing token',
      statusCode: 401,
    };
  }

  // Handle forbidden errors
  else if (err.name === 'ForbiddenError' || err.message.includes('permission')) {
    errorResponse = {
      success: false,
      error: 'Forbidden - Insufficient permissions',
      statusCode: 403,
    };
  }

  // Generic error
  else {
    errorResponse = {
      success: false,
      error:
        process.env.NODE_ENV === 'development'
          ? err.message
          : 'Internal server error',
      statusCode: 500,
    };

    // Include stack trace in development
    if (process.env.NODE_ENV === 'development') {
      (errorResponse as any).stack = err.stack;
    }
  }

  // Send error response
  res.status(errorResponse.statusCode).json({
    success: errorResponse.success,
    error: errorResponse.error,
    ...(errorResponse.details && { details: errorResponse.details }),
    ...(process.env.NODE_ENV === 'development' &&
      (errorResponse as any).stack && { stack: (errorResponse as any).stack }),
  });
};

/**
 * 404 Not Found handler
 * This should be registered after all routes
 */
export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.path}`,
  });
};

/**
 * Async handler wrapper
 * Wraps async route handlers to catch errors and pass to error middleware
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
