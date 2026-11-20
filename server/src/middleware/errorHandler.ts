import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/apiResponse';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Unhandled Error:', err);

  if (err.name === 'ZodError') {
    return sendError(res, 'Validation error', 400, err.errors);
  }

  if (err.code === 'P2002') {
    return sendError(res, `A record with this ${err.meta?.target || 'field'} already exists`, 409);
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  return sendError(res, message, statusCode);
};
