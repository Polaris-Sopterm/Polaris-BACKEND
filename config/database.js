module.exports = {
  server_ci: {
    database: 'polaris',
    dialect: 'sqlite',
    storage: 'db.sqlite3',
    logging: false,
  },
  ci: {
    database: 'polaris',
    define: {
      charset: 'utf8mb4',
      dialectOptions: {
        collate: 'utf8mb4_general_ci',
      },
    },
    dialect: 'mysql',
    host: process.env.DB_ENDPOINT || 'localhost',
    logging: false,
    password: 'polaris',
    username: 'root',
  },
  dev: {
    database: 'polaris_dev',
    define: {
      charset: 'utf8mb4',
      dialectOptions: {
        collate: 'utf8mb4_unicode_ci',
      },
    },
    dialect: 'mysql',
    host: process.env.DB_ENDPOINT,
    logging: console.log,
    password: process.env.DB_PASSWORD,
    username: process.env.DB_USERNAME,
  },
  production: {
    database: 'polaris_main',
    define: {
      charset: 'utf8mb4',
      dialectOptions: {
        collate: 'utf8mb4_unicode_ci',
      },
    },
    dialect: 'mysql',
    host: process.env.DB_ENDPOINT,
    password: process.env.DB_PASSWORD,
    username: process.env.DB_USERNAME,
  },
};
