module.exports = {
  up: (queryInterface, Sequelize) => (
    queryInterface.addColumn('journeys', 'isRetrospectSkipped', {
      allowNull: true,
      defaultValue: false,
      type: Sequelize.BOOLEAN,
    })
  ),
  down: (queryInterface) => (
    queryInterface.removeColumn('journeys', 'isRetrospectSkipped')
  ),
};
