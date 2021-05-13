class TokenNotFoundError extends Error {
  constructor(...params) {
    super(...params);

    if (Error.captureStackTrace) Error.captureStackTrace(this, TokenNotFoundError);
  }
}

module.exports = TokenNotFoundError;
