export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  if (err.name === 'ZodError') {
    return res.status(400).json({
      error: req.t ? req.t('middleware.validation_error') : 'Validation error',
      details: err.errors
    });
  }

  if (err.code === '23505') {
    return res.status(409).json({
      error: req.t ? req.t('middleware.duplicate_entry') : 'Duplicate entry',
      message: req.t ? req.t('middleware.record_already_exists') : 'A record with this value already exists'
    });
  }

  if (err.code === '23503') {
    return res.status(400).json({
      error: req.t ? req.t('middleware.foreign_key_violation') : 'Foreign key violation',
      message: req.t ? req.t('middleware.referenced_record_not_exist') : 'Referenced record does not exist'
    });
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || (req.t ? req.t('middleware.internal_server_error') : 'Internal server error');

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default { errorHandler, asyncHandler };
