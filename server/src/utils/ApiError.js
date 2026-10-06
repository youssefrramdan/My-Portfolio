// Predictable, operational errors (400, 401, 404, ...). Bugs and crashes should NOT use this class,
// so the error handler can log them as errors and hide their details in production.
export default class ApiError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    this.details = details;
  }

  static badRequest(message = 'Bad request', details = null) {
    return new ApiError(message, 400, details);
  }

  static unauthorized(message = 'Unauthorized') {
    return new ApiError(message, 401);
  }

  static forbidden(message = 'Forbidden') {
    return new ApiError(message, 403);
  }

  static notFound(message = 'Resource not found') {
    return new ApiError(message, 404);
  }

  static conflict(message = 'Conflict', details = null) {
    return new ApiError(message, 409, details);
  }

  static tooMany(message = 'Too many requests, please try again later') {
    return new ApiError(message, 429);
  }
}
