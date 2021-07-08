module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      await queryInterface.createTable(
        'users',
        {
          idx: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER,
          },
          email: {
            allowNull: false,
            type: Sequelize.STRING(128),
            unique: true,
          },
          name: {
            allowNull: false,
            type: Sequelize.STRING(20),
          },
          password: {
            allowNull: false,
            type: Sequelize.STRING(200),
          },
          createdAt: {
            allowNull: false,
            type: Sequelize.DATE(3),
          },
          updatedAt: {
            allowNull: false,
            type: Sequelize.DATE(3),
          },
          deletedAt: {
            allowNull: true,
            type: Sequelize.DATE(3),
          },
        },
        { transaction },
      );

      await queryInterface.createTable(
        'journeys',
        {
          idx: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER,
          },
          title: {
            allowNull: false,
            type: Sequelize.STRING,
          },
          value1: {
            allowNull: false,
            type: Sequelize.ENUM([
              '행복',
              '절제',
              '감사',
              '휴식',
              '성장',
              '변화',
              '건강',
              '극복',
              '도전',
            ]),
          },
          value2: {
            allowNull: true,
            type: Sequelize.ENUM([
              '행복',
              '절제',
              '감사',
              '휴식',
              '성장',
              '변화',
              '건강',
              '극복',
              '도전',
            ]),
          },
          weekInfo: {
            allowNull: false,
            type: Sequelize.INTEGER,
          },
          date: {
            allowNull: false,
            type: Sequelize.DATEONLY,
          },
          createdAt: {
            allowNull: false,
            type: Sequelize.DATE(3),
          },
          updatedAt: {
            allowNull: false,
            type: Sequelize.DATE(3),
          },
          userIdx: {
            allowNull: false,
            type: Sequelize.INTEGER,
          },
        },
        { transaction },
      );

      await queryInterface.createTable(
        'toDos',
        {
          idx: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER,
          },
          title: {
            allowNull: false,
            type: Sequelize.STRING,
          },
          date: {
            allowNull: false,
            type: Sequelize.DATE,
          },
          isTop: {
            allowNull: false,
            defaultValue: false,
            type: Sequelize.BOOLEAN,
          },
          isDone: {
            allowNull: true,
            defaultValue: null,
            type: Sequelize.DATE(3),
          },
          createdAt: {
            allowNull: false,
            type: Sequelize.DATE(3),
          },
          updatedAt: {
            allowNull: false,
            type: Sequelize.DATE(3),
          },
          userIdx: {
            allowNull: false,
            type: Sequelize.INTEGER,
          },
          journeyIdx: {
            allowNull: true,
            type: Sequelize.INTEGER,
          },
        },
        { transaction },
      );

      await transaction.commit();
    } catch (e) {
      await transaction.rollback();
      throw e;
    }
  },

  down: async (queryInterface) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.dropTable('users', { transaction });
      await queryInterface.dropTable('journeys', { transaction });
      await queryInterface.dropTable('toDos', { transaction });

      await transaction.commit();
    } catch (e) {
      await transaction.rollback();
      throw e;
    }
  },
};
