/* eslint-disable no-param-reassign */
const crypto = require('crypto');

const db = require('../models');

const { User } = db;

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

/**
 * @returns {Promise<void>}
 * @throws Error
 */
const truncateAllTables = async () => {
  const transaction = await db.sequelize.transaction();

  try {
    await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 0;', {
      transaction,
    });
    await db.sequelize.truncate({
      cascade: true,
      force: true,
      restartIdentity: true,
      transaction,
    });
    await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 1;', {
      transaction,
    });

    await transaction.commit();
  } catch (e) {
    if (transaction) await transaction.rollback();
    throw e;
  }
};

module.exports = {
  createEmailUser,
  truncateAllTables,
};
