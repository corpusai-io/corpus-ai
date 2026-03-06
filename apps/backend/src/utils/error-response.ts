import { Response } from 'express';

/**
 * Standard application error class
 */
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/**
 * Standard error response helper
 */
export function errorResponse(
  res: Response,
  statusCode: number,
  code: string,
  message: string,
  details?: any
) {
  return res.status(statusCode).json({
    error: true,
    code,
    message,
    ...(details !== undefined && { details }),
  });
}

/** Common error codes */
export const ErrorCodes = {
  AUTH_REQUIRED: 'AUTH_REQUIRED',
  INVALID_TOKEN: 'INVALID_TOKEN',
  ACCESS_DENIED: 'ACCESS_DENIED',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  QUOTA_EXCEEDED: 'QUOTA_EXCEEDED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  STRIPE_NOT_CONFIGURED: 'STRIPE_NOT_CONFIGURED',
  DUPLICATE: 'DUPLICATE',
  RATE_LIMITED: 'RATE_LIMITED',
} as const;
