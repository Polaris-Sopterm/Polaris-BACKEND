module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.createTable('retrospects', {
        idx: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        value: {
          allowNull: false,
          type: Sequelize.TEXT,
        },
        record1: {
          allowNull: true,
          defaultValue: null,
          type: Sequelize.TEXT,
        },
        record2: {
          allowNull: true,
          defaultValue: null,
          type: Sequelize.TEXT,
        },
        record3: {
          allowNull: true,
          defaultValue: null,
          type: Sequelize.TEXT,
        },
        year: {
          allowNull: false,
          type: Sequelize.INTEGER.UNSIGNED,
        },
        month: {
          allowNull: false,
          type: Sequelize.INTEGER.UNSIGNED,
        },
        weekNo: {
          allowNull: false,
          type: Sequelize.INTEGER.UNSIGNED,
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
      }, { transaction });

      await queryInterface.addConstraint('retrospects', {
        type: 'foreign key',
        fields: ['userIdx'],
        name: 'retrospects_users_fk',
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
      await queryInterface.removeConstraint('retrospects',
        'retrospects_users_fk',
        { transaction });
      await queryInterface.dropTable('retrospects', { transaction });

      await transaction.commit();
    } catch (e) {
      await transaction.rollback();
      throw e;
    }
  },
};
