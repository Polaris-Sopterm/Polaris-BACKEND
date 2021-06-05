const db = require('../models');

const {
  RefreshToken,
  ToDo,
  Token,
  Journey,
  User,
} = db;

/**
 * @returns {Promise<void>}
 * @throws Error
 */
const ci = async () => {
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

const server = async () => {
  const transaction = await User.sequelize.transaction();

  try {
    await RefreshToken.truncate({
      cascade: true,
      restartIdentity: true,
      force: true,
      transaction,
    });
    await ToDo.truncate({
      cascade: true,
      restartIdentity: true,
      force: true,
      transaction,
    });
    await Journey.truncate({
      cascade: true,
      restartIdentity: true,
      force: true,
      transaction,
    });
    await User.truncate({
      cascade: true,
      restartIdentity: true,
      force: true,
      transaction,
    });
    await Token.truncate({
      cascade: true,
      restartIdentity: true,
      force: true,
      transaction,
    });

    await db.sequelize.query('DELETE FROM `sqlite_sequence`;', { transaction });

    await transaction.commit();
  } catch (e) {
    await transaction.rollback();
    console.error(e);
    throw e;
  }
};

const config = {
  ci,
  server,
};

module.exports = config;
