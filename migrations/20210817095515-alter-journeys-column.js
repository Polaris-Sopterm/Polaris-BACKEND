module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('journeys', 'value1', {
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
      allowNull: true,
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('journeys', 'value1', {
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
      allowNull: false,
    });
  },
};
