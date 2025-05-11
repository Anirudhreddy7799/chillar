/**
 * Error Handling Utility
 * 
 * This module provides standardized error handling for the application.
 * It formats errors in a consistent way and provides appropriate responses
 * based on the environment (development vs. production).
 */

const env = require('./env').default;

/**
 * Custom API Error class for representing API errors
 */
class ApiError extends Error {
  constructor(statusCode, message, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Format an error response for the API
 */
function formatErrorResponse(err) {
  // Default values
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  // Basic error response
  const errorResponse = {
    error: {
      message,
      status: statusCode,
    }
  };
  
  // Add additional details in development
  if (env.isDev()) {
    errorResponse.error.stack = err.stack;
    if (err.details) {
      errorResponse.error.details = err.details;
    }
  }
  
  return {
    statusCode,
    body: errorResponse
  };
}

/**
 * Express middleware for handling errors
 */
function errorMiddleware(err, req, res, next) {
  console.error('API Error:', err);
  
  const { statusCode, body } = formatErrorResponse(err);
  
  res.status(statusCode).json(body);
}

/**
 * Async handler to simplify error handling in route handlers
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Create a standardized 404 Not Found error
 */
function notFoundError(message = 'Resource not found') {
  return new ApiError(404, message);
}

/**
 * Create a standardized 400 Bad Request error
 */
function badRequestError(message = 'Bad request', details = null) {
  return new ApiError(400, message, details);
}

/**
 * Create a standardized 401 Unauthorized error
 */
function unauthorizedError(message = 'Unauthorized') {
  return new ApiError(401, message);
}

/**
 * Create a standardized 403 Forbidden error
 */
function forbiddenError(message = 'Forbidden') {
  return new ApiError(403, message);
}

/**
 * Create a standardized 500 Internal Server Error
 */
function serverError(message = 'Internal server error', details = null) {
  return new ApiError(500, message, details);
}

module.exports = {
  ApiError,
  formatErrorResponse,
  errorMiddleware,
  asyncHandler,
  notFoundError,
  badRequestError,
  unauthorizedError,
  forbiddenError,
  serverError
};