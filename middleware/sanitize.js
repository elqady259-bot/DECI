const TEST_REGEX = /^\$|\./;

function isPlainObject(value) {
  return Object.prototype.toString.call(value) === '[object Object]';
}

function sanitizeObject(obj) {
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  if (!isPlainObject(obj)) {
    return obj;
  }

  return Object.keys(obj).reduce((result, key) => {
    const cleanKey = key.replace(TEST_REGEX, '');
    const value = obj[key];

    result[cleanKey] = sanitizeObject(value);
    return result;
  }, {});
}

module.exports = function () {
  return (req, res, next) => {
    if (req.body) req.body = sanitizeObject(req.body);
    if (req.query) req.query = sanitizeObject(req.query);
    if (req.params) req.params = sanitizeObject(req.params);
    if (req.headers) req.headers = sanitizeObject(req.headers);
    next();
  };
};
