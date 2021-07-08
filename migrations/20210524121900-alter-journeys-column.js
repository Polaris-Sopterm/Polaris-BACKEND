module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      await queryInterface.renameColumn('journeys', 'weekInfo', 'weekNo', {
        transaction,
      });
      await queryInterface.changeColumn(
        'journeys',
        'weekNo',
        {
          type: Sequelize.INTEGER.UNSIGNED,
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'journeys',
        'year',
        {
          allowNull: false,
          type: Sequelize.INTEGER.UNSIGNED,
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'journeys',
        'month',
        {
          allowNull: false,
          type: Sequelize.INTEGER.UNSIGNED,
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
      await queryInterface.renameColumn('journeys', 'weekInfo', 'weekNo', {
        transaction,
      });
      await queryInterface.changeColumn('journeys', 'weekNo', { transaction });
      await queryInterface.removeColumn('journeys', 'year', { transaction });
      await queryInterface.removeColumn('journeys', 'month', { transaction });

      await transaction.commit();
    } catch (e) {
      await transaction.rollback();
      throw e;
    }
  },
};
