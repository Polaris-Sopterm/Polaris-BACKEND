module.exports = {
  up: (queryInterface) => (queryInterface.renameColumn('users', 'name',
    'nickname')),
  down: (queryInterface) => (queryInterface.renameColumn('users', 'nickname',
    'name')),
};
