import { Response } from 'express';
import { ApiResponse } from '../types';

export const sendSuccess = <T>(
  res: Response,
  data?: T,
  message?: string,
  statusCode = 200,
  pagination?: ApiResponse['pagination']
) => {
  return res.status(statusCode).json({
    success: true,
    ...(message && { message }),
    ...(data !== undefined && { data }),
    ...(pagination && { pagination }),
  });
};

export const sendError = (
  res: Response,
  error: string,
  statusCode = 400,
  details?: any
) => {
  return res.status(statusCode).json({
    success: false,
    error,
    ...(details && { details }),
  });
};
