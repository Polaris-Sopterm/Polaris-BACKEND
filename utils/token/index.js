const token = require('./token');
const TokenExpiredError = require('./tokenExpiredError');
const TokenNotFoundError = require('./tokenNotFoundError');

module.exports = {
  ...token,
  TokenExpiredError,
  TokenNotFoundError,
};
