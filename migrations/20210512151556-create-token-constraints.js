module.exports = {
  async up(queryInterface) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addConstraint('refreshTokens', {
        type: 'foreign key',
        fields: ['userIdx'],
        name: 'refreshTokens_users_fk',
        references: {
          table: 'users',
          field: 'idx',
        },
        onDelete: 'cascade',
        onUpdate: 'cascade',
        transaction,
      });

      await queryInterface.addConstraint('tokens', {
        type: 'foreign key',
        fields: ['userIdx'],
        name: 'tokens_users_fk',
        references: {
          table: 'users',
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
  async down(queryInterface) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.removeConstraint(
        'refreshTokens',
        'refreshTokens_users_fk',
        { transaction },
      );

      await queryInterface.removeConstraint(
        'tokens',
        'tokens_users_fk',
        { transaction },
      );
      await transaction.commit();
    } catch (e) {
      await transaction.rollback();
      throw e;
    }
  },
};
