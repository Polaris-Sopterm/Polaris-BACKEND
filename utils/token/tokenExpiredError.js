class TokenExpiredError extends Error {
  constructor(...params) {
    super(...params);

    if (Error.captureStackTrace) Error.captureStackTrace(this, TokenExpiredError);
  }
}

module.exports = TokenExpiredError;
