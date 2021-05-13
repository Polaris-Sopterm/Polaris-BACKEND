const crypto = require('crypto');

/**
 * Generate random hexadecimal string.
 * @param {number} length
 * @returns {string}
 */
const getRandomHexString = (length) => {
  if ((length % 2) !== 0) throw Error('`length` should be even number.');
  return crypto.randomBytes(length / 2).toString('hex');
};

/**
 * Get random integer in range [min, max).
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
const getRandomInteger = (min, max) => {
  const a = Math.ceil(min);
  const b = Math.floor(max);
  return Math.floor(Math.random() * (b - a)) + a;
};

module.exports = {
  getRandomHexString,
  getRandomInteger,
};
