import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';

interface ErrorResponse {
  success: false;
  status: string;
  message: string;
  stack?: string;
  errors?: any;
}

const handleCastErrorDB = (err: any): AppError => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err: any): AppError => {
  const field = Object.keys(err.keyValue)[0];
  const message = `Duplicate field value: ${field}. Please use another value`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err: any): AppError => {
  const errors = Object.values(err.errors).map((el: any) => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = (): AppError => {
  return new AppError('Invalid token. Please log in again', 401);
};

const handleJWTExpiredError = (): AppError => {
  return new AppError('Your token has expired. Please log in again', 401);
};

const sendErrorDev = (err: any, res: Response): void => {
  const response: ErrorResponse = {
    success: false,
    status: err.status,
    message: err.message,
    stack: err.stack,
    errors: err.errors
  };

  res.status(err.statusCode).json(response);
};

const sendErrorProd = (err: any, res: Response): void => {
  if (err.isOperational) {
    const response: ErrorResponse = {
      success: false,
      status: err.status,
      message: err.message
    };

    res.status(err.statusCode).json(response);
  } else {
    console.error('ERROR 💥', err);

    const response: ErrorResponse = {
      success: false,
      status: 'error',
      message: 'Something went wrong'
    };

    res.status(500).json(response);
  }
};

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    let error = { ...err };
    error.message = err.message;

    if (err.name === 'CastError') error = handleCastErrorDB(err);
    if (err.code === 11000) error = handleDuplicateFieldsDB(err);
    if (err.name === 'ValidationError') error = handleValidationErrorDB(err);
    if (err.name === 'JsonWebTokenError') error = handleJWTError();
    if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, res);
  }
};
