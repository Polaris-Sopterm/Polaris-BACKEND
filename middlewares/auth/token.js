const env = process.env.NODE_ENV;

const crypto = require('crypto');

const jwt = require('jsonwebtoken');
const moment = require('moment');

const authConfig = require('../../config/auth')[env];

/**
 * @param {Request} req
 * @returns {string|null}
 */
const extractToken = (req) => {
  // If Authorization header is not exists or null, return null.
  if (!('headers' in req) || !('authorization' in req.headers)) return null;
  const raw = req.headers.authorization;

  // If raw value is not considered as true, return null.
  if (!raw) return null;

  // Split raw value by space.
  const split = raw.split(' ');

  // If raw value was not split into two parts, return null.
  if (split.length !== 2) return null;

  // If first part is not equal to 'Bearer', return null.
  if (split[0] !== 'Bearer') return null;
  // If second part is not considered as true, return null.
  if (!split[1]) return null;

  return split[1];
};

/**
 * @param {object} data
 * @returns {undefined|*}
 */
const generateAccessToken = (data) => {
  const secret = authConfig.accessTokenSecret;

  const options = {
    algorithm: 'HS512',
    expiresIn: authConfig.accessTokenExpire,
    issuer: 'polaris',
  };

  return jwt.sign(data, secret, options);
};

/**
 * @returns {string}
 */
const generateRefreshToken = () => {
  // 56 byte random string(112 characters in hexadecimal form).
  const random = crypto.randomBytes(56).toString('hex');
  // 8 byte timestamp(milliseconds; 16 characters in hexadecimal form).
  const timestamp = moment().valueOf().toString(16).padStart(16, '0');
  // 128 characters.
  return random + timestamp;
};

module.exports = {
  extractToken,
  generateAccessToken,
  generateRefreshToken,
};
