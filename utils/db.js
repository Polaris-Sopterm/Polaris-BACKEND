const db = require('../models');

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
  truncateAllTables,
};
