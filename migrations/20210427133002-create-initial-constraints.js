module.exports = {
  up: async (queryInterface) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addConstraint('journeys', ['userIdx'], {
        type: 'foreign key',
        name: 'journeys_users_fk',
        references: {
          table: 'users',
          field: 'idx',
        },
        onDelete: 'cascade',
        onUpdate: 'cascade',
        transaction,
      });

      await queryInterface.addConstraint('toDos', ['userIdx'], {
        type: 'foreign key',
        name: 'toDos_users_fk',
        references: {
          table: 'users',
          field: 'idx',
        },
        onDelete: 'cascade',
        onUpdate: 'cascade',
        transaction,
      });

      await queryInterface.addConstraint('toDos', ['journeyIdx'], {
        type: 'foreign key',
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
    await queryInterface.removeConstraint('journeys', 'journeys_users_fk');
    await queryInterface.removeConstraint('toDos', 'toDos_users_fk');
    await queryInterface.removeConstraint('toDos', 'toDos_journeys_fk');
  },
};
