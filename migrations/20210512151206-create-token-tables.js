module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.createTable('tokens', {
        id: {
          allowNull: false,
          autoIncrement: false,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true,
          type: Sequelize.UUID,
        },
        secret: {
          allowNull: false,
          type: Sequelize.STRING,
        },
        action: {
          allowNull: false,
          type: Sequelize.TEXT,
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
        userIdx: {
          allowNull: true,
          type: Sequelize.INTEGER,
        },
      }, { transaction });

      await queryInterface.createTable('refreshTokens', {
        id: {
          allowNull: false,
          autoIncrement: true,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        refreshToken: {
          allowNull: false,
          type: Sequelize.STRING(128),
          unique: true,
        },
        expiresAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
        userIdx: {
          allowNull: false,
          type: Sequelize.INTEGER,
        },
      }, { transaction });

      await transaction.commit();
    } catch (e) {
      await transaction.rollback();
      throw e;
    }
  },

  async down(queryInterface) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.dropTable('refreshTokens', { transaction });
      await queryInterface.dropTable('tokens', { transaction });

      await transaction.commit();
    } catch (e) {
      await transaction.rollback();
      throw e;
    }
  },
};
