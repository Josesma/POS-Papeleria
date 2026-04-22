import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { ApiError } from '../types';

/**
 * Global error handling middleware.
 * Catches all errors and returns consistent JSON responses.
 */
export function errorHandler(
  err: ApiError,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Zod validation errors
  if (err instanceof ZodError) {
    const details = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    res.status(400).json({
      success: false,
      error: 'Error de validación',
      details,
    });
    return;
  }

  // Custom errors with statusCode
  if (err.statusCode) {
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
    });
    return;
  }

  // Unknown errors
  const fs = require('fs');
  const logEntry = `[${new Date().toISOString()}] ${err.stack}\n\n`;
  fs.appendFileSync('error.log', logEntry);
  
  console.error('❌ Error no controlado:', err);
  res.status(500).json({
    success: false,
    error: 'Error interno del servidor',
  });
}
