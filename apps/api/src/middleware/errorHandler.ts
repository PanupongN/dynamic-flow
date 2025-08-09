import { Request, Response, NextFunction } from 'express';

export interface ApiError extends Error {
  statusCode?: number;
  details?: string[];
}

export function errorHandler(
  error: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Log error details
  console.error(`Error ${req.method} ${req.path}:`, {
    message: error.message,
    stack: error.stack,
    statusCode: error.statusCode,
    details: error.details,
    body: req.body,
    params: req.params,
    query: req.query
  });

  // Default error response
  let statusCode = error.statusCode || 500;
  let message = error.message || 'Internal Server Error';
  let details = error.details || [];

  // Handle specific error types
  if (error.message.includes('ENOENT')) {
    statusCode = 404;
    message = 'Resource not found';
  } else if (error.message.includes('Validation failed')) {
    statusCode = 400;
    message = 'Validation error';
  } else if (error.message.includes('duplicate key')) {
    statusCode = 409;
    message = 'Resource already exists';
  }

  // Send error response
  res.status(statusCode).json({
    error: message,
    details,
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method
  });
}

export function notFound(req: Request, res: Response) {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.path}`,
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method
  });
}

export function createError(statusCode: number, message: string, details?: string[]): ApiError {
  const error = new Error(message) as ApiError;
  error.statusCode = statusCode;
  error.details = details;
  return error;
}
