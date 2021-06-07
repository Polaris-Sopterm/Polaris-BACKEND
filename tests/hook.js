const db = require('../models');

before(function () {
  console.log('global hook');
});

after(async function () {
  await db.sequelize.close();
});
