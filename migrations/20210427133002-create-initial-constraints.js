module.exports = {
  up: async (queryInterface) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addConstraint('journeys', {
        type: 'foreign key',
        fields: ['userIdx'],
        name: 'journeys_users_fk',
        references: {
          table: 'users',
          field: 'idx',
        },
        onDelete: 'cascade',
        onUpdate: 'cascade',
        transaction,
      });

      await queryInterface.addConstraint('toDos', {
        type: 'foreign key',
        fields: ['userIdx'],
        name: 'toDos_users_fk',
        references: {
          table: 'users',
          field: 'idx',
        },
        onDelete: 'cascade',
        onUpdate: 'cascade',
        transaction,
      });

      await queryInterface.addConstraint('toDos', {
        type: 'foreign key',
        fields: ['journeyIdx'],
        name: 'toDos_journeys_fk',
        references: {
          table: 'journeys',
          field: 'idx',
        },
        onDelete: 'cascade',
        onUpdate: 'cascade',
        transaction,
      });

      await transaction.commit();
    } catch (e) {
      await transaction.rollback();
      throw e;
    }
  },

  down: async (queryInterface) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.removeConstraint('journeys', 'journeys_users_fk', {
        transaction,
      });
      await queryInterface.removeConstraint('toDos', 'toDos_users_fk', {
        transaction,
      });
      await queryInterface.removeConstraint('toDos', 'toDos_journeys_fk', {
        transaction,
      });
      await transaction.commit();
    } catch (e) {
      await transaction.rollback();
      throw e;
    }
  },
};
