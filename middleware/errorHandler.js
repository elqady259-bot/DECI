const errorHandler = (err, req, res, next) => {
  let error = err;

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    error = new Error(messages.join(', '));
    error.statusCode = 400;
  } else if (err.name === 'CastError') {
    error = new Error(`Resource not found with id of ${err.value}`);
    error.statusCode = 404;
  } else if (err.code === 11000) {
    error = new Error('Duplicate field value entered');
    error.statusCode = 400;
  }

  const statusCode = error.statusCode || 500;
  const message = error.message || 'Server Error';

  res.status(statusCode).json({
    success: false,
    error: message,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
};

module.exports = errorHandler;
