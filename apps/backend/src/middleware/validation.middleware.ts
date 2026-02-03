import { Request, Response, NextFunction } from 'express';

/**
 * Validate chatbot creation request
 */
export function validateCreateChatbot(req: Request, res: Response, next: NextFunction) {
  const { username, origin } = req.body;

  const errors: string[] = [];

  if (!username) {
    errors.push('username is required');
  }

  if (!origin) {
    errors.push('origin is required');
  }

  if (origin && !isValidUrl(origin) && origin !== 'files') {
    errors.push('origin must be a valid URL or "files"');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors
    });
  }

  next();
}

/**
 * Validate chatbot update request
 */
export function validateUpdateChatbot(req: Request, res: Response, next: NextFunction) {
  const { accessMode, language } = req.body;

  const errors: string[] = [];

  if (accessMode && !['PUBLIC', 'PRIVATE'].includes(accessMode)) {
    errors.push('accessMode must be either PUBLIC or PRIVATE');
  }

  if (language && typeof language !== 'string') {
    errors.push('language must be a string');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors
    });
  }

  next();
}

/**
 * Validate chatbot ID parameter
 */
export function validateChatbotId(req: Request, res: Response, next: NextFunction) {
  const { id } = req.params;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({
      error: 'Invalid chatbot ID'
    });
  }

  next();
}

/**
 * Helper: Check if string is a valid URL
 */
function isValidUrl(string: string): boolean {
  try {
    new URL(string);
    return true;
  } catch {
    return false;
  }
}

/**
 * Sanitize string input (remove HTML, XSS prevention)
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') return '';

  return input
    .trim()
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, ''); // Remove on* event handlers
}

/**
 * Sanitize object recursively
 */
export function sanitizeObject(obj: any): any {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  const sanitized: any = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];
      if (typeof value === 'string') {
        sanitized[key] = sanitizeString(value);
      } else if (typeof value === 'object') {
        sanitized[key] = sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }
  }

  return sanitized;
}

/**
 * Middleware to sanitize request body
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction) {
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  next();
}

/**
 * Middleware to prevent SQL injection
 */
export function preventSqlInjection(req: Request, res: Response, next: NextFunction) {
  const sqlPattern = /(\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b|\bDROP\b|\bUNION\b|\bEXEC\b|\bEXECUTE\b)/i;

  const checkValue = (value: any): boolean => {
    if (typeof value === 'string') {
      return sqlPattern.test(value);
    }
    if (typeof value === 'object' && value !== null) {
      return Object.values(value).some(checkValue);
    }
    return false;
  };

  if (req.body && checkValue(req.body)) {
    return res.status(400).json({
      error: 'Validation failed',
      message: 'Potentially malicious input detected',
    });
  }

  if (req.query && checkValue(req.query)) {
    return res.status(400).json({
      error: 'Validation failed',
      message: 'Potentially malicious input detected',
    });
  }

  next();
}

/**
 * Middleware to prevent XSS attacks
 */
export function preventXss(req: Request, res: Response, next: NextFunction) {
  const xssPattern = /<script|<iframe|javascript:|onerror=|onload=/i;

  const checkValue = (value: any): boolean => {
    if (typeof value === 'string') {
      return xssPattern.test(value);
    }
    if (typeof value === 'object' && value !== null) {
      return Object.values(value).some(checkValue);
    }
    return false;
  };

  if (req.body && checkValue(req.body)) {
    return res.status(400).json({
      error: 'Validation failed',
      message: 'Potentially malicious input detected (XSS)',
    });
  }

  next();
}

/**
 * Combined security validation middleware
 */
export const securityValidation = [preventSqlInjection, preventXss, sanitizeBody];

/**
 * Error handling middleware
 */
export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  console.error('Error:', err);

  res.status(500).json({
    error: 'Internal server error',
    message: err.message || 'Unknown error occurred'
  });
}
