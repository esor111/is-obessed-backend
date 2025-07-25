import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../utils/validation';

export interface ApiError extends Error {
  statusCode?: number;
}

// Global error handling middleware
export const errorHandler = (
  error: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', error);

  // Validation errors
  if (error instanceof ValidationError) {
    return res.status(400).json({ error: error.message });
  }

  // Database connection errors
  if (error.message.includes('Failed to')) {
    return res.status(500).json({ error: 'Database operation failed' });
  }

  // Default error response
  const statusCode = error.statusCode || 500;
  const message = statusCode === 500 ? 'Internal server error' : error.message;

  res.status(statusCode).json({ error: message });
};

// 404 handler for undefined routes
export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({ error: 'API endpoint not found' });
};

// Request validation middleware
export const validateJsonBody = (req: Request, res: Response, next: NextFunction) => {
  if (req.method === 'POST' || req.method === 'PUT') {
    if (!req.is('application/json')) {
      return res.status(400).json({ error: 'Content-Type must be application/json' });
    }
  }
  next();
};

// Request logging middleware
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const timestamp = new Date().toISOString();
  console.log(`${timestamp} ${req.method} ${req.path}`);
  next();
};