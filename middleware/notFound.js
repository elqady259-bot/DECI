const ApiError = require('../utils/ApiError');

const notFound = (req, res, next) => {
  next(new ApiError(`Route not found: ${req.originalUrl}`, 404));
};

module.exports = notFound;
