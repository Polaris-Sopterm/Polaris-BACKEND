const TokenExpiredError = require('./tokenExpiredError');
const TokenNotFoundError = require('./tokenNotFoundError');
const { getRandomHexString } = require('../random');
const db = require('../../models');

const { Token } = db;

/**
 * Create new token.
 * @param {User} user
 * @param {object} action
 * @param {Transaction} transaction
 * @returns {Promise<Token>}
 * @throws Error
 */
const createToken = async (user, action, transaction) => {
  // Generate 16-character random string.
  const secret = getRandomHexString(16);

  const tokenData = {
    secret,
    action,
    userId: user ? user.id : null,
  };

  let token;
  if (transaction) token = await Token.create(tokenData, { transaction });
  else token = await Token.create(tokenData);

  if (!token) throw Error('Failed to create token.');

  token.plainSecret = secret;

  return token;
};

/**
 * Get existing token.
 * @param {string} id
 * @param {string} secret
 * @returns {Promise<Token>}
 * @throws Error
 * @throws TokenExpiredError
 * @throws TokenNotFoundError
 */
const getToken = async (id, secret) => {
  const token = await Token.findByPk(id);

  if (!token) throw new TokenNotFoundError('Incorrect token id.');
  if (!token.validateSecret(secret)) throw new TokenNotFoundError('Incorrect token secret.');
  if (token.isExpired) throw new TokenExpiredError('Token already expired.');

  return token;
};

module.exports = {
  createToken,
  getToken,
};
