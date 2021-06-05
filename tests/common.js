/* eslint-disable no-param-reassign */
const crypto = require('crypto');

const db = require('../models');

const {
  User,
} = db;

const commonPassword = 'p@ssw0rd';

/**
 * @param {number} len
 * @returns {string}
 */
const generateRandom = (len) => (crypto.randomBytes(len).toString('hex'));

/**
 * @returns {Promise<*>}
 */
const createEmailUser = async () => {
  const user = await User.create({
    email: `${generateRandom(4)}@email.com`,
    nickname: `nick_${generateRandom(4)}`,
    password: commonPassword,
  });
  return user;
};

module.exports = {
  createEmailUser,
};
